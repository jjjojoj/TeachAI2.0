import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { authedProcedure } from "~/server/trpc/main";
import { generateTargetedQuestions, type AIModelKey } from "~/server/ai-service";

export const generateClassQuestionsProcedure = authedProcedure
  .input(z.object({
    classId: z.number(),
    knowledgeAreaIds: z.array(z.number()).optional(),
    questionCount: z.number().min(1).max(20).default(5),
    difficultyLevel: z.enum(["easy", "medium", "hard"]).default("medium"),
    modelKey: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      // Verify class ownership
      const classData = await db.class.findFirst({
        where: {
          id: input.classId,
          teacherId: ctx.auth.teacherId,
        },
      });

      if (!classData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "班级不存在或您没有权限",
        });
      }

      // Get all students in the class
      const students = await db.student.findMany({
        where: { classId: input.classId },
      });

      if (students.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "该班级暂无学生",
        });
      }

      const studentIds = students.map(s => s.id);

      // Get mistakes across ALL students in the class
      const mistakesFilter: any = {
        studentId: { in: studentIds },
      };
      if (input.knowledgeAreaIds && input.knowledgeAreaIds.length > 0) {
        mistakesFilter.knowledgeAreaId = { in: input.knowledgeAreaIds };
      }

      const recentMistakes = await db.mistake.findMany({
        where: mistakesFilter,
        include: {
          knowledgeArea: true,
          student: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });

      const examMistakes = await db.examMistake.findMany({
        where: mistakesFilter,
        include: {
          knowledgeArea: true,
          student: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });

      const allMistakes = [...recentMistakes, ...examMistakes];

      if (allMistakes.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "该班级暂无错题记录，无法生成练习题",
        });
      }

      // Get knowledge areas from mistakes
      const knowledgeAreaIds = Array.from(
        new Set(allMistakes.map(m => m.knowledgeAreaId).filter(Boolean))
      ) as number[];

      // Get teaching materials
      const teachingMaterials = await db.teachingMaterial.findMany({
        where: {
          teacherId: ctx.auth.teacherId,
          knowledgeAreaId: { in: knowledgeAreaIds },
        },
        include: { knowledgeArea: true },
        orderBy: { updatedAt: 'desc' },
      });

      const modelKey = (input.modelKey as AIModelKey) || 'siliconcloud/qwen2.5-vl-7b';

      // Count how many students made each mistake type
      const mistakeFrequency = new Map<string, { description: string; count: number; students: string[] }>();
      allMistakes.forEach(m => {
        const key = m.description;
        if (mistakeFrequency.has(key)) {
          const entry = mistakeFrequency.get(key)!;
          entry.count++;
          if (!entry.students.includes(m.student?.name || '')) {
            entry.students.push(m.student?.name || '');
          }
        } else {
          mistakeFrequency.set(key, {
            description: m.description,
            count: 1,
            students: [m.student?.name || ''],
          });
        }
      });

      // Sort by frequency — most common mistakes first
      const topMistakes = Array.from(mistakeFrequency.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Generate questions focused on most common class mistakes
      const questions = await generateTargetedQuestions({
        mistakes: allMistakes.slice(0, 15),
        teachingMaterials,
        studentName: `${classData.name} 全班`,
        questionCount: input.questionCount,
        difficultyLevel: input.difficultyLevel,
        modelKey,
      });

      return {
        success: true,
        questions,
        totalMistakes: allMistakes.length,
        topMistakes,
        materialsUsed: teachingMaterials.length,
        modelUsed: modelKey,
        className: classData.name,
        studentCount: students.length,
      };
    } catch (error) {
      console.error("Generate class questions error:", error);
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "生成全班练习题失败",
      });
    }
  });

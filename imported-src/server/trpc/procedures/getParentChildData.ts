import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const getParentChildData = baseProcedure
  .input(z.object({
    authToken: z.string(),
    childId: z.number(),
  }))
  .query(async ({ input }) => {
    try {
      // Verify parent authentication
      const verified = jwt.verify(input.authToken, env.JWT_SECRET);
      const parsed = z.object({ parentId: z.number() }).parse(verified);

      // Verify the child belongs to this parent
      const child = await db.student.findUnique({
        where: { id: input.childId },
        include: {
          parent: true,
          class: {
            select: {
              name: true,
              teacher: {
                select: {
                  name: true,
                },
              },
            },
          },
          assignments: {
            include: {
              analysis: {
                include: {
                  mistakes: {
                    include: {
                      knowledgeArea: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          exams: {
            include: {
              analysis: {
                include: {
                  mistakes: {
                    include: {
                      knowledgeArea: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          studentKnowledgeAreas: {
            include: {
              knowledgeArea: true,
            },
          },
          mistakes: {
            include: {
              knowledgeArea: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 10, // Most recent mistakes
          },
        },
      });

      if (!child) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Child not found",
        });
      }

      if (child.parent?.id !== parsed.parentId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only access your own child's data",
        });
      }

      // Calculate statistics
      const totalAssignments = child.assignments.length;
      const analyzedAssignments = child.assignments.filter((a: { analysis: unknown }) => a.analysis).length;
      const totalMistakes = child.mistakes.length;
      const averageScore = child.exams.length > 0 
        ? child.exams.reduce((sum: number, exam: { analysis: { grade?: string | null } | null }) => {
            const gradeStr = exam.analysis?.grade;
            if (gradeStr) {
              const parsed = parseFloat(gradeStr);
              if (!isNaN(parsed)) return sum + parsed;
            }
            return sum;
          }, 0) / child.exams.length
        : null;

      // Group mistakes by knowledge area
      const mistakesByArea = child.mistakes.reduce((acc: Record<string, typeof child.mistakes>, mistake: typeof child.mistakes[number]) => {
        if (mistake.knowledgeArea) {
          const areaName = mistake.knowledgeArea.name;
          if (!acc[areaName]) {
            acc[areaName] = [];
          }
          acc[areaName].push(mistake);
        }
        return acc;
      }, {} as Record<string, typeof child.mistakes>);

      return {
        child: {
          id: child.id,
          name: child.name,
          schoolName: child.schoolName,
          grade: child.grade,
          class: child.class ? {
            name: child.class.name,
            teacher: child.class.teacher,
          } : null,
        },
        statistics: {
          totalAssignments,
          analyzedAssignments,
          totalMistakes,
          averageScore,
          analysisRate: totalAssignments > 0 ? (analyzedAssignments / totalAssignments) * 100 : 0,
        },
        assignments: child.assignments.map((assignment: typeof child.assignments[number]) => ({
          id: assignment.id,
          title: assignment.title,
          imageUrl: assignment.imageUrl,
          uploadedBy: assignment.uploadedBy,
          createdAt: assignment.createdAt,
          analysis: assignment.analysis ? {
            grade: assignment.analysis.grade,
            feedback: assignment.analysis.feedback,
            strengths: assignment.analysis.strengths,
            improvements: assignment.analysis.improvements,
          } : null,
          mistakesCount: assignment.analysis?.mistakes?.length ?? 0,
        })),
        exams: child.exams.map((exam: typeof child.exams[number]) => ({
          id: exam.id,
          title: exam.title,
          createdAt: exam.createdAt,
          mistakesCount: exam.analysis?.mistakes?.length ?? 0,
        })),
        knowledgeAreas: child.studentKnowledgeAreas.map((ka: typeof child.studentKnowledgeAreas[number]) => ({
          id: ka.knowledgeArea.id,
          name: ka.knowledgeArea.name,
          description: ka.knowledgeArea.description,
          proficiencyLevel: ka.proficiencyLevel,
        })),
        recentMistakes: child.mistakes.map((mistake: typeof child.mistakes[number]) => ({
          id: mistake.id,
          description: mistake.description,
          createdAt: mistake.createdAt,
          knowledgeArea: mistake.knowledgeArea?.name ?? null,
        })),
        mistakesByArea,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      
      console.error("Get parent child data error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve child data",
      });
    }
  });

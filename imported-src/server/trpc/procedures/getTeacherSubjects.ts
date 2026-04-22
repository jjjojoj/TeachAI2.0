import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const getTeacherSubjects = baseProcedure
  .input(z.object({ 
    authToken: z.string(),
  }))
  .query(async ({ input }) => {
    try {
      // Verify teacher authentication
      const verified = jwt.verify(input.authToken, env.JWT_SECRET);
      const parsed = z.object({ teacherId: z.number() }).parse(verified);

      // Get teacher with their knowledge areas and related student data
      const teacher = await db.teacher.findUnique({
        where: { id: parsed.teacherId },
        include: {
          teacherKnowledgeAreas: {
            include: {
              knowledgeArea: {
                include: {
                  studentKnowledgeAreas: {
                    include: {
                      student: {
                        include: {
                          class: {
                            select: {
                              name: true,
                            },
                          },
                          mistakes: {
                            where: {
                              knowledgeAreaId: {
                                not: null,
                              },
                            },
                            include: {
                              knowledgeArea: true,
                            },
                          },
                          assignments: {
                            include: {
                              analysis: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  mistakes: {
                    include: {
                      student: {
                        include: {
                          class: {
                            select: {
                              name: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!teacher) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Teacher not found",
        });
      }

      // Process the data to provide subject-specific insights
      const subjects = teacher.teacherKnowledgeAreas.map((tka: typeof teacher.teacherKnowledgeAreas[number]) => {
        const knowledgeArea = tka.knowledgeArea;
        const studentKnowledgeAreas = knowledgeArea.studentKnowledgeAreas;
        const mistakes = knowledgeArea.mistakes;

        // Calculate statistics
        const totalStudents = studentKnowledgeAreas.length;
        const averageProficiency = studentKnowledgeAreas.length > 0 
          ? studentKnowledgeAreas.reduce((sum: number, s: typeof studentKnowledgeAreas[number]) => {
              const level = s.proficiencyLevel;
              if (level === 'advanced') return sum + 0.8;
              if (level === 'intermediate') return sum + 0.5;
              return sum + 0.2;
            }, 0) / studentKnowledgeAreas.length
          : 0;

        // Group mistakes by frequency to find common problem areas
        const commonMistakes = mistakes
          .reduce((acc: Record<string, { description: string; count: number; students: Set<number> }>, mistake: typeof mistakes[number]) => {
            const key = mistake.description;
            if (!acc[key]) {
              acc[key] = {
                description: mistake.description,
                count: 0,
                students: new Set<number>(),
              };
            }
            acc[key].count += 1;
            if (mistake.student?.id) {
              acc[key].students.add(mistake.student.id);
            }
            return acc;
          }, {} as Record<string, { description: string; count: number; students: Set<number> }>);

        const topMistakes = Object.values(commonMistakes)
          .map((m: { description: string; count: number; students: Set<number> }) => ({
            description: m.description,
            count: m.count,
            affectedStudents: m.students.size,
          }))
          .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
          .slice(0, 5);

        // Calculate improvement trends (students who need attention)
        const studentsNeedingAttention = studentKnowledgeAreas
          .filter((s: typeof studentKnowledgeAreas[number]) => {
            const level = s.proficiencyLevel;
            return !level || level === 'beginner';
          })
          .map((s: typeof studentKnowledgeAreas[number]) => ({
            id: s.student.id,
            name: s.student.name,
            className: s.student.class?.name ?? null,
            proficiencyLevel: s.proficiencyLevel,
            recentMistakes: s.student.mistakes.filter((m: typeof s.student.mistakes[number]) => 
              m.knowledgeAreaId === knowledgeArea.id
            ).length,
          }))
          .sort((a: { proficiencyLevel: string | null }, b: { proficiencyLevel: string | null }) => {
            const levelOrder: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };
            const aVal = a.proficiencyLevel ? (levelOrder[a.proficiencyLevel] ?? 1) : 0;
            const bVal = b.proficiencyLevel ? (levelOrder[b.proficiencyLevel] ?? 1) : 0;
            return aVal - bVal;
          });

        return {
          id: knowledgeArea.id,
          name: knowledgeArea.name,
          description: knowledgeArea.description,
          statistics: {
            totalStudents,
            averageProficiency: Math.round(averageProficiency * 100),
            studentsNeedingAttention: studentsNeedingAttention.length,
            totalMistakes: mistakes.length,
          },
          topMistakes,
          studentsNeedingAttention,
          assignedAt: tka.createdAt,
        };
      });

      return {
        teacher: {
          id: teacher.id,
          name: teacher.name,
          phoneNumber: teacher.phoneNumber,
        },
        subjects,
        totalSubjects: subjects.length,
        totalStudentsAcrossSubjects: [...new Set(
          subjects.flatMap((s: typeof subjects[number]) => s.studentsNeedingAttention.map((student: { id: number }) => student.id))
        )].length,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      
      console.error("Get teacher subjects error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve teacher subjects",
      });
    }
  });

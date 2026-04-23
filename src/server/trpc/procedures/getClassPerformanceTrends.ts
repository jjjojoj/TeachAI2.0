import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { authedProcedure } from "~/server/trpc/main";

// Convert letter grade to numeric score (0-100 scale)
function gradeToScore(grade: string): number {
  const g = grade.trim().toUpperCase();
  const gradeMap: Record<string, number> = {
    'A+': 98, 'A': 95, 'A-': 92,
    'B+': 88, 'B': 85, 'B-': 82,
    'C+': 78, 'C': 75, 'C-': 72,
    'D+': 68, 'D': 65, 'D-': 62,
    'F': 50,
  };
  if (gradeMap[g] !== undefined) return gradeMap[g];
  // Try parsing as number directly (e.g. "85", "90/100")
  const parsed = parseFloat(g.replace(/\/\d+$/, ''));
  return isNaN(parsed) ? 0 : Math.min(parsed, 100);
}

export const getClassPerformanceTrends = authedProcedure
  .input(z.object({ 
    classId: z.number(),
    timeRange: z.enum(['7d', '30d', '90d', '1y', 'all']).optional().default('30d'),
  }))
  .query(async ({ input, ctx }) => {
    try {
      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (input.timeRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
        default:
          startDate = new Date(0);
          break;
      }

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
          message: "Class not found or you don't have permission to view it",
        });
      }

      // Get all students in the class
      const students = await db.student.findMany({
        where: {
          classId: input.classId,
        },
        select: {
          id: true,
          name: true,
        },
      });

      const studentIds = students.map(s => s.id);

      // Fetch all assignments for the class within the time range
      const assignments = await db.assignment.findMany({
        where: {
          studentId: {
            in: studentIds,
          },
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          analysis: true,
          student: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Fetch all exams for the class within the time range
      const exams = await db.exam.findMany({
        where: {
          studentId: {
            in: studentIds,
          },
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          analysis: true,
          student: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Group assignments by date and calculate averages
      const assignmentsByDate = new Map<string, { scores: number[], count: number }>();
      assignments
        .filter(a => a.analysis?.grade)
        .forEach(assignment => {
          const date = assignment.createdAt.toISOString().split('T')[0] ?? '';
          const score = gradeToScore(assignment.analysis!.grade!);

          if (!assignmentsByDate.has(date)) {
            assignmentsByDate.set(date, { scores: [], count: 0 });
          }

          const dateData = assignmentsByDate.get(date)!;
          dateData.scores.push(score);
          dateData.count++;
        });

      // Group exams by date and calculate averages
      const examsByDate = new Map<string, { scores: number[], count: number }>();
      exams
        .filter(e => e.analysis?.grade)
        .forEach(exam => {
          const date = exam.createdAt.toISOString().split('T')[0] ?? '';
          const score = gradeToScore(exam.analysis!.grade!);

          if (!examsByDate.has(date)) {
            examsByDate.set(date, { scores: [], count: 0 });
          }
          
          const dateData = examsByDate.get(date)!;
          dateData.scores.push(score);
          dateData.count++;
        });

      // Create assignment trends
      const assignmentTrends = Array.from(assignmentsByDate.entries())
        .map(([date, data]) => ({
          date,
          averageScore: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
          count: data.count,
          type: 'assignment' as const,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Create exam trends
      const examTrends = Array.from(examsByDate.entries())
        .map(([date, data]) => ({
          date,
          averageScore: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
          count: data.count,
          type: 'exam' as const,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Combine performance trends
      const performanceTrends = [...assignmentTrends, ...examTrends]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate student participation trends
      const participationByDate = new Map<string, Set<number>>();
      [...assignments, ...exams].forEach(item => {
        const date = item.createdAt.toISOString().split('T')[0] ?? '';
        if (!participationByDate.has(date)) {
          participationByDate.set(date, new Set());
        }
        participationByDate.get(date)!.add(item.student!.id);
      });

      const participationTrends = Array.from(participationByDate.entries())
        .map(([date, studentSet]) => ({
          date,
          activeStudents: studentSet.size,
          participationRate: (studentSet.size / students.length) * 100,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate mistake trends for the class
      const mistakes = await db.mistake.findMany({
        where: {
          studentId: { in: studentIds },
          createdAt: { gte: startDate },
        },
        include: { knowledgeArea: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      });

      const examMistakes = await db.examMistake.findMany({
        where: {
          studentId: { in: studentIds },
          createdAt: { gte: startDate },
        },
        include: { knowledgeArea: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      });

      const mistakesByDate = new Map<string, number>();
      [...mistakes, ...examMistakes].forEach(mistake => {
        const date = mistake.createdAt.toISOString().split('T')[0] ?? '';
        mistakesByDate.set(date, (mistakesByDate.get(date) || 0) + 1);
      });

      const mistakeTrends = Array.from(mistakesByDate.entries())
        .map(([date, count]) => ({
          date,
          mistakes: count,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        performanceTrends,
        participationTrends,
        mistakeTrends,
        assignmentTrends,
        examTrends,
        // Student ranking: per-student average score across assignments + exams
        studentRanking: students.map(s => {
          const studentAssignments = assignments.filter(a => a.studentId === s.id && a.analysis?.grade);
          const studentExams = exams.filter(e => e.studentId === s.id && e.analysis?.grade);
          const assignmentScores = studentAssignments.map(a => gradeToScore(a.analysis!.grade!));
          const examScores = studentExams.map(e => gradeToScore(e.analysis!.grade!));
          const allScores = [...assignmentScores, ...examScores];
          const avg = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
          return {
            studentId: s.id,
            studentName: s.name,
            averageScore: Math.round(avg * 10) / 10,
            assignmentCount: studentAssignments.length,
            examCount: studentExams.length,
            totalItems: allScores.length,
            assignmentAvg: assignmentScores.length > 0 ? Math.round(assignmentScores.reduce((a, b) => a + b, 0) / assignmentScores.length * 10) / 10 : 0,
            examAvg: examScores.length > 0 ? Math.round(examScores.reduce((a, b) => a + b, 0) / examScores.length * 10) / 10 : 0,
          };
        }).sort((a, b) => b.averageScore - a.averageScore),
        // Knowledge area analysis: mistake count per knowledge area
        knowledgeAreaAnalysis: (() => {
          const areaMap = new Map<number, { name: string; mistakeCount: number; studentCount: Set<number> }>();
          [...mistakes, ...examMistakes].forEach(m => {
            const kaId = m.knowledgeAreaId;
            if (!kaId) return;
            const kaName = m.knowledgeArea?.name || '未分类';
            if (!areaMap.has(kaId)) {
              areaMap.set(kaId, { name: kaName, mistakeCount: 0, studentCount: new Set() });
            }
            const entry = areaMap.get(kaId)!;
            entry.mistakeCount++;
            entry.studentCount.add(m.studentId);
          });
          return Array.from(areaMap.entries())
            .map(([id, data]) => ({
              knowledgeAreaId: id,
              name: data.name,
              mistakeCount: data.mistakeCount,
              affectedStudentCount: data.studentCount.size,
            }))
            .sort((a, b) => b.mistakeCount - a.mistakeCount);
        })(),
        summary: {
          totalStudents: students.length,
          totalAssignments: assignments.length,
          totalExams: exams.length,
          averageAssignmentScore: assignmentTrends.length > 0
            ? assignmentTrends.reduce((sum, a) => sum + a.averageScore, 0) / assignmentTrends.length
            : 0,
          averageExamScore: examTrends.length > 0
            ? examTrends.reduce((sum, e) => sum + e.averageScore, 0) / examTrends.length
            : 0,
          totalMistakes: mistakeTrends.reduce((sum, m) => sum + m.mistakes, 0),
          averageParticipationRate: participationTrends.length > 0
            ? participationTrends.reduce((sum, p) => sum + p.participationRate, 0) / participationTrends.length
            : 0,
          timeRange: input.timeRange,
        },
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      });
    }
  });

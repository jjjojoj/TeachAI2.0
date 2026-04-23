import React, { useState } from 'react';
import { useTRPC } from '~/trpc/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '~/components/Toast';
import {
  Brain, User, Target, Settings, Lightbulb, X,
  Search, Users, ChevronRight, Loader2, GraduationCap,
  CheckCircle2, UserPlus
} from 'lucide-react';
import { useAuthStore } from '~/stores/authStore';
import {
  GeneratedQuestionsDisplay,
  type QuestionGenerationResult,
} from '~/components/question/GeneratedQuestionsDisplay';

interface TargetedQuestionGeneratorProps {
  classId?: number;
  studentId?: number;
  onClose?: () => void;
}

export function TargetedQuestionGenerator({ classId: propClassId, studentId: propStudentId, onClose }: TargetedQuestionGeneratorProps) {
  const toast = useToast();
  const trpc = useTRPC();
  const { authToken } = useAuthStore();
  const [generatedQuestions, setGeneratedQuestions] = useState<QuestionGenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(propClassId || null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>(propStudentId ? [propStudentId] : []);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [mode, setMode] = useState<'student' | 'class'>('student');
  const [searchQuery, setSearchQuery] = useState('');

  // Get classes
  const classesQuery = useQuery({
    ...trpc.getTeacherClasses.queryOptions({ authToken: authToken || "" }),
    enabled: !!authToken && !propClassId,
  });

  // Get students for selected class
  const studentsQuery = useQuery({
    ...trpc.getClassStudents.queryOptions({
      authToken: authToken || "",
      classId: selectedClassId!,
    }),
    enabled: !!selectedClassId && !!authToken,
  });

  const classes = classesQuery.data?.classes || [];
  const students = studentsQuery.data?.students || [];
  const filteredStudents = searchQuery
    ? students.filter(s => s.name.includes(searchQuery))
    : students;

  const toggleStudent = (studentId: number) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAll = () => {
    setSelectedStudentIds(filteredStudents.map(s => s.id));
  };

  const clearSelection = () => {
    setSelectedStudentIds([]);
  };

  // Generate for individual student(s)
  const generateStudentMutation = useMutation({
    mutationFn: async (data: { studentIds: number[]; questionCount: number; difficultyLevel: string }) => {
      if (data.studentIds.length === 1) {
        return (trpc as any).generateTargetedQuestions.mutateAsync({
          authToken: authToken!,
          studentId: data.studentIds[0],
          questionCount: data.questionCount,
          difficultyLevel: data.difficultyLevel,
        });
      } else {
        return (trpc as any).generateClassQuestions.mutateAsync({
          authToken: authToken!,
          classId: selectedClassId!,
          studentIds: data.studentIds,
          questionCount: data.questionCount,
          difficultyLevel: data.difficultyLevel,
        });
      }
    },
    onSuccess: (result: any) => {
      setGeneratedQuestions(result);
      const count = result.questions?.length || 0;
      const label = result.studentName || result.className || '';
      toast.success(`成功为 ${label} 生成 ${count} 道练习题！`);
    },
    onError: (error: any) => {
      toast.error(error?.message || '生成练习题失败，请重试');
    },
  });

  // Generate for whole class
  const generateClassMutation = useMutation({
    mutationFn: (data: { classId: number; questionCount: number; difficultyLevel: string }) =>
      (trpc as any).generateClassQuestions.mutateAsync({
        authToken: authToken!,
        ...data,
      }),
    onSuccess: (result: any) => {
      setGeneratedQuestions(result);
      toast.success(`成功为 ${result.className} 全班生成 ${result.questions.length} 道练习题！`);
    },
    onError: (error: any) => {
      toast.error(error?.message || '生成全班练习题失败，请重试');
    },
  });

  const handleGenerate = async () => {
    if (!authToken) {
      toast.error('请先登录');
      return;
    }

    setIsGenerating(true);
    try {
      if (mode === 'class') {
        if (!selectedClassId) {
          toast.error('请选择班级');
          return;
        }
        await generateClassMutation.mutateAsync({
          classId: selectedClassId,
          questionCount,
          difficultyLevel,
        });
      } else {
        if (selectedStudentIds.length === 0) {
          toast.error('请至少选择一个学生');
          return;
        }
        await generateStudentMutation.mutateAsync({
          studentIds: selectedStudentIds,
          questionCount,
          difficultyLevel,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // If questions have been generated, show the results
  if (generatedQuestions) {
    return (
      <GeneratedQuestionsDisplay
        result={generatedQuestions}
        onRegenerate={() => setGeneratedQuestions(null)}
        onClose={onClose}
      />
    );
  }

  const selectedStudentNames = students
    .filter(s => selectedStudentIds.includes(s.id))
    .map(s => s.name);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">生成练习题</h2>
            <p className="text-sm text-gray-500">基于错题库智能生成针对性练习</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setMode('student'); setGeneratedQuestions(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
            mode === 'student'
              ? 'bg-purple-600 text-white shadow-glow'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <User className="w-4 h-4" />
          选择学生
        </button>
        <button
          onClick={() => { setMode('class'); setGeneratedQuestions(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
            mode === 'class'
              ? 'bg-purple-600 text-white shadow-glow'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          全班练习
        </button>
      </div>

      {/* Step 1: Select Class */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <GraduationCap className="inline w-4 h-4 mr-1" />
          选择班级
        </label>
        {propClassId ? (
          <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">
            {classes.find(c => c.id === propClassId)?.name || `班级 ${propClassId}`}
          </div>
        ) : (
          <select
            value={selectedClassId || ""}
            onChange={(e) => {
              const id = e.target.value ? Number(e.target.value) : null;
              setSelectedClassId(id);
              setSelectedStudentIds([]);
              setSearchQuery("");
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          >
            <option value="">请选择班级</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}（{cls._count.students}人）</option>
            ))}
          </select>
        )}
      </div>

      {/* Step 2: Select Student(s) — multi-select for individual mode */}
      {mode === 'student' && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserPlus className="inline w-4 h-4 mr-1" />
            选择学生
            {selectedStudentIds.length > 0 && (
              <span className="ml-2 text-purple-600">（已选 {selectedStudentIds.length} 人）</span>
            )}
          </label>

          {/* Selected student tags */}
          {selectedStudentIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedStudentNames.map(name => (
                <span key={name} className="inline-flex items-center gap-1 text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                  <User className="w-3 h-3" />
                  {name}
                  <button
                    onClick={() => {
                      const sid = students.find(s => s.name === name)?.id;
                      if (sid) toggleStudent(sid);
                    }}
                    className="ml-0.5 text-purple-400 hover:text-purple-600"
                  >&times;</button>
                </span>
              ))}
              <button onClick={clearSelection} className="text-xs text-gray-500 hover:text-red-500 px-2 py-1">
                清空
              </button>
            </div>
          )}

          {/* Search */}
          {students.length > 5 && (
            <div className="relative mb-2">
              <input
                type="text"
                placeholder="搜索学生姓名..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!selectedClassId}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white disabled:bg-gray-100 disabled:text-gray-400 text-sm"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          )}

          {/* Select All / None buttons */}
          {selectedClassId && students.length > 0 && !propStudentId && (
            <div className="flex gap-2 mb-2">
              <button
                onClick={selectAll}
                className="text-xs text-purple-600 hover:text-purple-800 px-2 py-1 rounded hover:bg-purple-50 transition-colors"
              >
                全选当前{searchQuery ? '搜索结果' : ''}
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={clearSelection}
                className="text-xs text-gray-500 hover:text-red-500 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
              >
                取消全选
              </button>
            </div>
          )}

          {/* Student list */}
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
            {!selectedClassId ? (
              <div className="text-center py-6 text-gray-400 text-sm">请先选择班级</div>
            ) : studentsQuery.isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 text-purple-500 animate-spin mr-2" />
                <span className="text-gray-400 text-sm">加载中...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                {searchQuery ? '未找到匹配的学生' : '该班级暂无学生'}
              </div>
            ) : (
              filteredStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleStudent(s.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 transition-colors flex items-center justify-between ${
                    selectedStudentIds.includes(s.id) ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      selectedStudentIds.includes(s.id)
                        ? 'bg-purple-600 border-purple-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedStudentIds.includes(s.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span>{s.name}</span>
                  </div>
                  {selectedStudentIds.includes(s.id) && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Step 3: Settings */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Target className="inline w-4 h-4 mr-1" />
            题目数量
          </label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          >
            {[1, 3, 5, 8, 10, 15, 20].map(count => (
              <option key={count} value={count}>{count} 道题</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Settings className="inline w-4 h-4 mr-1" />
            难度等级
          </label>
          <div className="flex gap-2">
            {[
              { value: 'easy' as const, label: '简单' },
              { value: 'medium' as const, label: '中等' },
              { value: 'hard' as const, label: '困难' },
            ].map((level) => (
              <button
                key={level.value}
                onClick={() => setDifficultyLevel(level.value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  difficultyLevel === level.value
                    ? 'bg-purple-600 text-white shadow-glow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex gap-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-all"
          >
            取消
          </button>
        )}
        <button
          onClick={handleGenerate}
          disabled={
            isGenerating ||
            !selectedClassId ||
            (mode === 'student' && selectedStudentIds.length === 0)
          }
          className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              正在生成...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              {mode === 'class'
                ? '为全班生成练习题'
                : selectedStudentIds.length > 1
                  ? `为 ${selectedStudentIds.length} 名学生生成`
                  : '为学生生成练习题'
              }
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
        <div className="flex items-start space-x-2">
          <Lightbulb className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-1">
              {mode === 'class'
                ? 'AI 将基于全班高频错题生成练习题'
                : selectedStudentIds.length > 1
                  ? `AI 将基于 ${selectedStudentIds.length} 名学生的共同薄弱点生成练习题`
                  : 'AI 将基于学生个人错题生成练习题'
              }
            </p>
            <ul className="list-disc list-inside space-y-1 text-purple-700">
              <li>分析历史错题记录和错误模式</li>
              <li>结合教学资料库作为参考</li>
              <li>针对性设计题目和详细解析</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

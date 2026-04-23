import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "~/stores/authStore";
import { useToast } from "~/components/Toast";
import { 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Brain,
  LogIn,
  Phone,
  Lock,
  ArrowLeft,
  Eye,
} from "lucide-react";

export const Route = createFileRoute("/auth/")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      const { userRole } = useAuthStore.getState();
      if (userRole === "parent") {
        navigate({ to: "/parent-dashboard", replace: true });
      } else {
        navigate({ to: "/dashboard", replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  const showNotAvailable = () => {
    toast.info("注册功能暂未开放，请通过首页「体验演示」入口体验系统");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl float-slow"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl float-medium"></div>
      <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl float-fast"></div>
      
      {/* 返回首页按钮 */}
      <div className="relative z-20 p-4">
        <button
          onClick={() => navigate({ to: "/" })}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:bg-white hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>
      </div>

      <div className="relative min-h-[calc(100vh-80px)] flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary p-12 flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl float-slow"></div>
          <div className="absolute bottom-20 right-32 w-24 h-24 bg-purple-400/20 rounded-full blur-lg float-medium"></div>
          <div className="absolute top-1/2 right-8 w-16 h-16 bg-indigo-400/20 rounded-full blur-md float-fast"></div>
          
          <div className="relative z-10 animate-fade-in">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">智评</h1>
            </div>
            
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              用{" "}
              <span className="text-blue-200">AI智能分析</span> 
              {" "}改变您的教学方式
            </h2>
            
            <p className="text-blue-100 text-xl mb-12 leading-relaxed">
              简化作业管理，分析学生表现，获得深度洞察，
              帮助每个学生取得成功。
            </p>

            <div className="space-y-8">
              <div className="flex items-start group">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">智能作业分析</h3>
                  <p className="text-blue-100">AI智能反馈和评分辅助，提供详细见解</p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">轻松班级管理</h3>
                  <p className="text-blue-100">使用直观工具组织学生并跟踪进度</p>
                </div>
              </div>
              
              <div className="flex items-start group">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">学习表现分析</h3>
                  <p className="text-blue-100">全面洞察和精美可视化报告</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Disabled Auth Form (visual only) */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md animate-slide-up">
            {/* Mobile-only logo */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mr-3 shadow-glow">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gradient-primary">智评</h1>
            </div>

            {/* Welcome text */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">欢迎！</h3>
                <p className="text-gray-600">登录您的教师账户开始使用</p>
              </div>
            </div>

            {/* Visual-only form (disabled) */}
            <div className="animate-scale-in">
              <div className="w-full max-w-md mx-auto">
                <div className="card overflow-hidden shadow-glow">
                  <div className="px-8 pt-8 pb-6">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
                        <LogIn className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">欢迎回来</h2>
                      <p className="text-gray-600 mt-2">登录您的教师账户</p>
                    </div>

                    <div className="space-y-6">
                      <div className="animate-slide-up">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          手机号码
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="tel"
                            className="form-input pl-10 bg-gray-50 cursor-not-allowed"
                            placeholder="请输入手机号码"
                            disabled
                            onClick={showNotAvailable}
                            onFocus={showNotAvailable}
                          />
                        </div>
                      </div>

                      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          密码
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="password"
                            className="form-input pl-10 pr-12 bg-gray-50 cursor-not-allowed"
                            placeholder="请输入您的密码"
                            disabled
                            onClick={showNotAvailable}
                            onFocus={showNotAvailable}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300">
                            <Eye className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <button
                          type="button"
                          onClick={showNotAvailable}
                          className="btn-primary w-full group"
                        >
                          登录
                          <LogIn className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>

                    {/* Notice banner */}
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm text-amber-800 text-center font-medium">
                        🔒 注册功能暂未开放
                      </p>
                      <p className="text-xs text-amber-600 text-center mt-1">
                        请通过首页「体验演示」入口体验系统
                      </p>
                      <button
                        onClick={() => navigate({ to: "/" })}
                        className="mt-3 w-full py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
                      >
                        前往首页体验演示
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

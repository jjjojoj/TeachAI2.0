import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "~/stores/authStore";
import { useTRPC } from "~/trpc/react";
import { toast } from "react-hot-toast";
import {
  GraduationCap,
  Brain,
  BarChart3,
  Users,
  PenTool,
  BookOpen,
  FileText,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Menu,
  XIcon,
  ChevronDown,
  Mail,
  MessageCircle,
  Shield,
  Zap,
  UserPlus,

  LayoutDashboard,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuthStore();
  const setTeacherAuth = useAuthStore((s) => s.setTeacherAuth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const trpc = useTRPC();

  const demoLoginMutation = useMutation(trpc.loginDemo.mutationOptions());

  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === "parent") {
        navigate({ to: "/parent-dashboard" });
      } else {
        // Use replace to prevent back button from landing on this page
        navigate({ to: "/dashboard", replace: true });
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleDemoLogin = async () => {
    try {
      const result = await demoLoginMutation.mutateAsync({});
      setTeacherAuth(result.authToken, result.teacher);
      navigate({ to: "/dashboard", replace: true });
    } catch {
      // silently fail — demo account not initialized
    }
  };

  const handleRegisterClick = () => {
    toast("注册功能暂未开放，请点击「体验演示」先体验完整功能", {
      icon: "🔔",
      duration: 4000,
      style: { maxWidth: "380px" },
    });
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      icon: Brain,
      title: "AI作业分析",
      desc: "上传学生作业，AI自动识别内容、评分并生成详细反馈报告",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: BarChart3,
      title: "数据可视化",
      desc: "多维度图表展示班级和学生表现趋势，数据驱动教学决策",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: Users,
      title: "班级管理",
      desc: "轻松创建班级、添加学生、管理分组，一切尽在掌控",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      icon: PenTool,
      title: "智能出题",
      desc: "基于错题库和知识点，AI自动生成针对性练习题",
      gradient: "from-orange-500 to-red-600",
    },
    {
      icon: BookOpen,
      title: "教学资料库",
      desc: "上传和管理教学材料，构建个人知识库",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      icon: FileText,
      title: "报告生成",
      desc: "一键生成班级/学生分析报告，支持家长沟通",
      gradient: "from-rose-500 to-purple-600",
    },
  ];

  const steps = [
    {
      num: 1,
      title: "注册账户",
      desc: "免费创建您的教师账户，只需手机号码",
      icon: UserPlus,
    },
    {
      num: 2,
      title: "创建班级",
      desc: "建立班级并添加学生，支持批量导入",
      icon: LayoutDashboard,
    },
    {
      num: 3,
      title: "开始分析",
      desc: "上传作业，AI即刻为您分析并生成报告",
      icon: Zap,
    },
  ];

  const faqs = [
    {
      q: "智评适合哪些人群？",
      a: "智评专为中小学教师设计，也适用于培训机构和辅导老师。无论您是语文、数学、英语还是其他学科的教师，智评都能帮助您高效批改作业、分析学生表现。未来我们还将支持家长端，让家校沟通更加便捷。",
    },
    {
      q: "AI分析的准确率如何？",
      a: "我们的AI基于先进的大语言模型，经过大量教育数据的训练和优化。作业识别准确率超过95%，评分与人工评分一致性达到90%以上。对于主观题，AI会提供参考评分和详细反馈，教师可以在此基础上进行微调。",
    },
    {
      q: "免费版有什么限制？",
      a: "免费版支持创建3个班级、每班最多50名学生，包含基础班级管理和学生信息管理功能，适合个人教师试用。升级专业版后可获得AI作业分析、智能出题、数据可视化等高级功能，AI分析次数为每月200次。",
    },
    {
      q: "数据安全如何保障？",
      a: "所有数据采用AES-256加密存储，传输过程使用TLS 1.3加密，符合教育数据安全规范。我们通过了等保二级认证，不会将您的数据用于任何其他目的。您可以随时导出或删除您的所有数据。",
    },
    {
      q: "可以随时取消订阅吗？",
      a: "当然可以！您可以随时取消订阅，不会产生任何额外费用。取消后您的账户将自动降级为免费版，所有班级数据和学生信息都会完整保留。如果您之后想重新升级，随时可以恢复订阅。",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ============ NAVIGATION BAR ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                智评{" "}
                <span className="text-gray-500 font-normal">EduReview</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollTo("features")}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
              >
                功能特性
              </button>
              <button
                onClick={() => scrollTo("pricing")}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
              >
                定价方案
              </button>
              <button
                onClick={() => scrollTo("faq")}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
              >
                常见问题
              </button>
              <button
                onClick={() => handleRegisterClick()}
                className="btn-primary text-sm px-5 py-2.5"
              >
                免费开始
              </button>
              <button
                onClick={handleDemoLogin}
                disabled={demoLoginMutation.isPending}
                className="text-sm px-5 py-2.5 rounded-xl font-semibold border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {demoLoginMutation.isPending ? "登录中..." : "体验演示"}
              </button>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XIcon className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-gray-200/50 animate-slide-down">
            <div className="px-4 py-3 space-y-1">
              <button
                onClick={() => scrollTo("features")}
                className="block w-full text-left px-4 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                功能特性
              </button>
              <button
                onClick={() => scrollTo("pricing")}
                className="block w-full text-left px-4 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                定价方案
              </button>
              <button
                onClick={() => scrollTo("faq")}
                className="block w-full text-left px-4 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                常见问题
              </button>
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => handleRegisterClick()}
                  className="btn-primary w-full text-sm px-5 py-2.5"
                >
                  免费开始
                </button>
                <button
                  onClick={handleDemoLogin}
                  disabled={demoLoginMutation.isPending}
                  className="w-full text-sm px-5 py-2.5 rounded-xl font-semibold border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {demoLoginMutation.isPending ? "登录中..." : "体验演示"}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-indigo-50 to-white"></div>

        {/* Decorative gradient blobs */}
        <div className="absolute top-20 left-[5%] w-72 h-72 bg-blue-400/[0.07] rounded-full blur-[80px] float-slow"></div>
        <div className="absolute top-40 right-[5%] w-96 h-96 bg-indigo-400/[0.06] rounded-full blur-[100px] float-medium"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-purple-400/[0.05] rounded-full blur-[80px] float-fast"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-pink-400/[0.05] rounded-full blur-[60px] float-slow"></div>
        <div className="absolute top-1/2 left-[10%] w-32 h-32 bg-cyan-400/[0.06] rounded-full blur-[50px] float-medium"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            {/* Badge pill */}
            <div className="inline-flex items-center space-x-2 bg-white/80 border border-blue-100 rounded-full px-4 py-1.5 mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                AI 赋能教育
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight animate-slide-up">
              AI 驱动的
              <br />
              <span className="text-gradient-primary">智能教育分析平台</span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up"
              style={{ animationDelay: "0.15s" }}
            >
              用先进的人工智能技术，让每一次作业批改都成为精准教学的机会
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <button
                onClick={handleDemoLogin}
                disabled={demoLoginMutation.isPending}
                className="btn-primary text-lg px-8 py-4 w-full sm:w-auto group"
              >
                {demoLoginMutation.isPending ? "登录中..." : "免费体验演示"}
                <ArrowRight className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo("features")}
                className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
              >
                了解更多
              </button>
            </div>

          </div>

          {/* Dashboard Mockup */}
          <div
            className="mt-16 md:mt-20 max-w-5xl mx-auto animate-slide-up"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="relative">
              {/* Gradient glow behind */}
              <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/20 via-indigo-500/25 to-purple-500/20 rounded-3xl blur-3xl"></div>

              {/* Main mockup card */}
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700/50">
                {/* Fake browser top bar */}
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="flex-1 mx-4 h-7 bg-gray-700 rounded-lg flex items-center px-3">
                    <span className="text-xs text-gray-400">
                      app.edureview.cn/dashboard
                    </span>
                  </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                  {[
                    { label: "班级总数", value: "12", color: "text-blue-400" },
                    {
                      label: "学生人数",
                      value: "486",
                      color: "text-green-400",
                    },
                    {
                      label: "本月分析",
                      value: "1,234",
                      color: "text-purple-400",
                    },
                    {
                      label: "平均分",
                      value: "87.5",
                      color: "text-orange-400",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-gray-800/80 rounded-xl p-3 md:p-4 border border-gray-700/50"
                    >
                      <div className="text-xs text-gray-400 mb-1">
                        {stat.label}
                      </div>
                      <div
                        className={`text-xl md:text-2xl font-bold ${stat.color}`}
                      >
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart area + AI status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 bg-gray-800/80 rounded-xl p-4 border border-gray-700/50">
                    <div className="text-sm text-gray-400 mb-3">
                      班级成绩趋势
                    </div>
                    <div className="flex items-end space-x-1.5 md:space-x-2 h-24 md:h-28">
                      {[
                        65, 72, 68, 80, 75, 85, 90, 78, 88, 92, 87, 95,
                      ].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm bg-gradient-to-t from-blue-500 to-indigo-400 opacity-80"
                          style={{ height: `${h}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50">
                    <div className="text-sm text-gray-400 mb-3">
                      AI 分析状态
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">已完成</span>
                          <span className="text-green-400">186/200</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full">
                          <div
                            className="h-2 bg-green-400 rounded-full"
                            style={{ width: "93%" }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">待分析</span>
                          <span className="text-yellow-400">14</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full">
                          <div
                            className="h-2 bg-yellow-400 rounded-full"
                            style={{ width: "7%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-700">
                        <div className="flex items-center space-x-1">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-xs text-purple-400 font-medium">
                            AI 分析准确率 96.2%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating decorative icons */}
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center float-slow hidden md:flex">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center float-medium hidden md:flex">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section id="features" className="py-24 md:py-32 bg-gray-50 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-200/[0.08] rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/[0.08] rounded-full blur-[80px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              强大的功能，<span className="text-gradient-primary">简单的设计</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              从作业分析到班级管理，一站式教育智能解决方案
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="card-interactive p-8 animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-glow`}
                >
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {f.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-24 md:py-32 bg-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-1/4 left-[5%] w-64 h-64 bg-indigo-100/[0.12] rounded-full blur-[80px]"></div>
        <div className="absolute bottom-1/4 right-[5%] w-72 h-72 bg-blue-100/[0.10] rounded-full blur-[80px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              三步开始<span className="text-gradient-primary">使用</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              简单三步，即刻体验AI智能教学
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 relative">
            {/* Connecting line (desktop only) */}
            <div
              className="hidden md:block absolute top-16 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200"
              style={{ left: "16%", right: "16%" }}
            ></div>

            {steps.map((s, i) => (
              <div key={i} className="text-center relative">
                {/* Step circle */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center border-2 border-blue-100">
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow-lg">
                      <s.icon className="w-9 h-9 text-white" />
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {s.num}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING SECTION ============ */}
      <section id="pricing" className="py-24 md:py-32 bg-gray-50 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-200/[0.08] rounded-full blur-[100px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              选择适合您的<span className="text-gradient-primary">方案</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              基础功能永久免费，AI功能按需升级
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto items-start">
            {/* FREE PLAN */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  免费版
                </h3>
                <p className="text-sm text-gray-400">适合个人教师试用</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                  ¥0
                </span>
                <span className="text-gray-400 ml-1">/月</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  { text: "创建最多 3 个班级", ok: true },
                  { text: "每班最多 50 名学生", ok: true },
                  { text: "基础班级管理", ok: true },
                  { text: "学生信息管理", ok: true },
                  { text: "邀请码加入班级", ok: true },
                  { text: "AI作业分析", ok: false },
                  { text: "智能出题", ok: false },
                  { text: "高级数据报告", ok: false },
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    {item.ok ? (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    )}
                    <span
                      className={
                        item.ok ? "text-gray-700" : "text-gray-400"
                      }
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleRegisterClick()}
                className="btn-secondary w-full"
              >
                免费注册
              </button>
            </div>

            {/* PRO PLAN (highlighted) */}
            <div className="relative bg-white rounded-2xl border-2 border-blue-500 p-8 shadow-xl md:-mt-4 md:mb-[-16px]">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-primary text-white text-sm font-bold px-5 py-1.5 rounded-full shadow-glow">
                  最受欢迎
                </span>
              </div>
              <div className="mb-6 mt-2">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  专业版
                </h3>
                <p className="text-sm text-gray-400">
                  适合需要AI功能的教师
                </p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-gray-400 tracking-tight">
                  暂未开放
                </span>
                <p className="text-sm text-gray-400 mt-2">敬请期待，即将上线</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "一切免费版功能",
                  "无限班级和学生",
                  "AI作业分析 (200次/月)",
                  "智能出题 (100次/月)",
                  "班级表现趋势图",
                  "基础分析报告",
                  "教学资料库",
                ].map((text, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{text}</span>
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="w-full px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-400 cursor-not-allowed"
              >
                敬请期待
              </button>
            </div>

            {/* SCHOOL PLAN */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  学校版
                </h3>
                <p className="text-sm text-gray-400">适合学校和培训机构</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  联系销售
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "一切专业版功能",
                  "无限AI分析次数",
                  "无限智能出题",
                  "高级数据分析",
                  "自定义报告模板",
                  "多教师协作",
                  "学校管理后台",
                  "专属技术支持",
                ].map((text, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{text}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => toast("学校版即将开放，敬请期待！", { icon: "🏫", duration: 3000 })}
                className="btn-secondary w-full"
              >
                联系我们
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ SECTION ============ */}
      <section id="faq" className="py-24 md:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              常见<span className="text-gradient-primary">问题</span>
            </h2>
            <p className="text-lg text-gray-500">
              如果您有其他问题，欢迎随时联系我们
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 animate-slide-down">
                    <p className="text-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BOTTOM CTA SECTION ============ */}
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-primary rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                准备用AI改变您的教学了吗？
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                免费注册，即刻体验智能教学助手
              </p>
              <button
                onClick={() => handleRegisterClick()}
                className="bg-white text-blue-600 font-bold px-8 py-4 rounded-xl text-lg hover:bg-blue-50 transition-colors shadow-lg group"
              >
                免费开始使用
                <ArrowRight className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">
                  智评{" "}
                  <span className="text-gray-500 font-normal">
                    EduReview
                  </span>
                </span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm mb-6">
                AI
                驱动的智能教育分析平台，帮助教师高效批改作业、精准分析学情，让每一次教学都更有针对性。
              </p>
              <div className="flex items-center space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Mail className="w-5 h-5 text-gray-400" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">产品</h4>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => scrollTo("features")}
                    className="text-sm hover:text-white transition-colors"
                  >
                    功能特性
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("pricing")}
                    className="text-sm hover:text-white transition-colors"
                  >
                    定价方案
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("faq")}
                    className="text-sm hover:text-white transition-colors"
                  >
                    常见问题
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">支持</h4>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-white transition-colors"
                  >
                    隐私政策
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-white transition-colors"
                  >
                    服务条款
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm hover:text-white transition-colors"
                  >
                    联系我们
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              © 2025 智评 EduReview. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-sm">
              <Shield className="w-4 h-4 text-green-500" />
              <span>数据安全，加密传输</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

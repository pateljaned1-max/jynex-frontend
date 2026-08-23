/**
 * AI Interviewer — Single-file React implementation
 * Structure mirrors: Navbar · Sidebar · Footer · Landing sections ·
 * Auth (Login + Signup) · Dashboard · Interview (RoleSelector → Session) · Results
 */
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain, Mic, MicOff, BarChart3, Zap, Clock, CheckCircle, ArrowRight,
  Play, Star, Users, TrendingUp, Code2, MessageSquare, Layers, ChevronRight,
  X, Menu, LogOut, Home, FileText, Settings, Send, Volume2, VolumeX,
  RotateCcw, Award, ThumbsUp, ThumbsDown, AlertCircle, Eye, Mail, Lock,
  User, Github, Chrome, Bot, Sparkles, HeartHandshake, ShoppingBag,
  ArrowDown, Pause, SkipForward, Phone, Wifi, WifiOff, ChevronDown,
  Briefcase, Target, Shield, Quote,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES  (mirrors types/interview.ts)
// ═══════════════════════════════════════════════════════════════════════════════

type Page = "landing" | "login" | "signup" | "dashboard" | "interview" | "results";
type InterviewStep = "role-select" | "session";
type InterviewerRole = "technical" | "hr" | "product" | "customer" | "behavioural";
type ExperienceLevel = "junior" | "mid" | "senior" | "staff";

interface Message { speaker: "ai" | "user"; text: string; ts: string; }
interface SelectedRole { type: InterviewerRole; level: ExperienceLevel; company: string; }

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS  (mirrors hooks/)
// ═══════════════════════════════════════════════════════════════════════════════

function useTimer(running = true) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return { seconds, formatted: fmt(seconds), reset: () => setSeconds(0) };
}

function useVoice() {
  const [recording, setRecording] = useState(false);
  const [amplitude, setAmplitude] = useState<number[]>(Array(20).fill(0.15));
  const rafRef = useRef<number | null>(null);
  const toggle = useCallback(() => {
    setRecording((r) => {
      if (!r) {
        const animate = () => {
          setAmplitude(Array.from({ length: 20 }, () => 0.15 + Math.random() * 0.85));
          rafRef.current = requestAnimationFrame(animate);
        };
        animate();
      } else {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setAmplitude(Array(20).fill(0.15));
      }
      return !r;
    });
  }, []);
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);
  return { recording, amplitude, toggle };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

function GlassCard({ children, className = "", hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md ${hover ? "transition-all duration-300 hover:border-indigo-500/40 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-indigo-500/10" : ""} ${className}`}>
      {children}
    </div>
  );
}

function PrimaryBtn({ children, onClick, className = "", disabled = false }: { children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
      {children}
    </button>
  );
}

function OutlineBtn({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`rounded-xl border border-indigo-500/50 px-6 py-3 font-semibold text-indigo-300 transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-white ${className}`}>
      {children}
    </button>
  );
}

function Chip({ children, active = false, color = "indigo", onClick }: { children: React.ReactNode; active?: boolean; color?: string; onClick?: () => void }) {
  const activeColors: Record<string, string> = {
    indigo: "border-indigo-500/60 bg-indigo-500/15 text-indigo-300",
    violet: "border-violet-500/60 bg-violet-500/15 text-violet-300",
    rose: "border-rose-500/60 bg-rose-500/15 text-rose-300",
    emerald: "border-emerald-500/60 bg-emerald-500/15 text-emerald-300",
    amber: "border-amber-500/60 bg-amber-500/15 text-amber-300",
    cyan: "border-cyan-500/60 bg-cyan-500/15 text-cyan-300",
  };
  return (
    <button onClick={onClick} className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${active ? (activeColors[color] ?? activeColors.indigo) : "border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"}`}>
      {children}
    </button>
  );
}

function Tag({ children, color = "indigo" }: { children: React.ReactNode; color?: string }) {
  const map: Record<string, string> = {
    indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
    violet: "bg-violet-500/15 text-violet-300 border-violet-500/25",
    emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    rose: "bg-rose-500/15 text-rose-300 border-rose-500/25",
    cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  };
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[color] ?? map.indigo}`}>{children}</span>;
}

function ScoreColor(score: number) {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-amber-400";
  return "text-rose-400";
}

function BarColor(score: number) {
  if (score >= 85) return "from-emerald-500 to-emerald-400";
  if (score >= 70) return "from-amber-500 to-amber-400";
  return "from-rose-500 to-rose-400";
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT — components/layout/
// ═══════════════════════════════════════════════════════════════════════════════

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/8 bg-[#050d1f]/90 backdrop-blur-xl" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <button onClick={() => onNavigate("landing")} className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="text-[15px] font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            AI Interviewer
          </span>
        </button>
        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {["Features", "How It Works", "Interviewers"].map((l) => (
            <button key={l} className="px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white">{l}</button>
          ))}
        </div>
        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <button onClick={() => onNavigate("login")} className="px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white">Login</button>
          <button onClick={() => onNavigate("signup")} className="rounded-xl border border-indigo-500/40 px-4 py-2 text-sm font-medium text-indigo-300 transition-all hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-white">Sign Up</button>
          <PrimaryBtn onClick={() => onNavigate("interview")} className="px-5 py-2 text-sm">Start Interview</PrimaryBtn>
        </div>
        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-400 hover:text-white md:hidden">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="border-t border-white/8 bg-[#050d1f]/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-2 px-6 py-5">
            {["Features", "How It Works", "Interviewers"].map((l) => (
              <button key={l} className="py-2 text-left text-sm font-medium text-slate-400 hover:text-white">{l}</button>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <button onClick={() => { onNavigate("login"); setMobileOpen(false); }} className="w-full rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-300 hover:border-white/20">Login</button>
              <PrimaryBtn onClick={() => { onNavigate("interview"); setMobileOpen(false); }} className="w-full py-2.5 text-sm">Start Interview</PrimaryBtn>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ onNavigate, activePage }: { onNavigate: (p: Page) => void; activePage: Page }) {
  const items: { icon: typeof Home; label: string; page: Page | null }[] = [
    { icon: Home, label: "Dashboard", page: "dashboard" },
    { icon: Play, label: "Practice", page: "interview" },
    { icon: BarChart3, label: "Analytics", page: null },
    { icon: FileText, label: "History", page: null },
    { icon: Settings, label: "Settings", page: null },
  ];
  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-white/8 bg-[#040b1a] px-4 py-6 lg:flex">
      <button onClick={() => onNavigate("landing")} className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI Interviewer</span>
      </button>
      <nav className="flex flex-col gap-1">
        {items.map(({ icon: Icon, label, page }) => (
          <button key={label} onClick={() => page && onNavigate(page)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${activePage === page ? "border border-indigo-500/30 bg-indigo-500/15 text-indigo-300" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-4">
        <GlassCard className="p-4" hover={false}>
          <p className="mb-1 text-sm font-semibold text-white">Upgrade to Pro</p>
          <p className="mb-3 text-xs leading-relaxed text-slate-500">Unlimited sessions, company simulations & real-time coaching.</p>
          <PrimaryBtn className="w-full py-2 text-sm">Upgrade Now</PrimaryBtn>
        </GlassCard>
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">A</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">Alex Johnson</p>
            <p className="truncate text-xs text-slate-500">alex@example.com</p>
          </div>
          <button onClick={() => onNavigate("landing")} className="ml-auto text-slate-600 hover:text-slate-400 transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <footer className="border-t border-white/6 px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <button onClick={() => onNavigate("landing")} className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600"><Bot className="h-5 w-5 text-white" /></div>
              <span className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI Interviewer</span>
            </button>
            <p className="max-w-xs text-sm leading-relaxed text-slate-600" style={{ fontFamily: "'Inter', sans-serif" }}>
              Realistic AI-powered interview practice that adapts to your answers and helps you land your dream role.
            </p>
            <div className="mt-5 flex gap-3">
              {[Github, Chrome].map((Icon, i) => (
                <button key={i} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-500 transition-all hover:border-white/20 hover:text-slate-300">
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          {[
            { heading: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
            { heading: "Resources", links: ["Blog", "Interview Tips", "Question Bank", "Company Guides"] },
            { heading: "Company", links: ["About", "Careers", "Press", "Contact"] },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-600">{heading}</p>
              <ul className="flex flex-col gap-2.5">
                {links.map((l) => <li key={l}><a href="#" className="text-sm text-slate-500 transition-colors hover:text-slate-300">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/6 pt-8 sm:flex-row">
          <p className="text-xs text-slate-700">© 2025 AI Interviewer. All rights reserved.</p>
          <div className="flex gap-5">{["Privacy", "Terms", "Cookies"].map((l) => <a key={l} href="#" className="text-xs text-slate-700 transition-colors hover:text-slate-400">{l}</a>)}</div>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LANDING — components/landing/
// ═══════════════════════════════════════════════════════════════════════════════

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-violet-600/8 blur-[90px]" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="g" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M 64 0 L 0 0 0 64" fill="none" stroke="white" strokeWidth="1" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
      </div>
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300">
          <Sparkles className="h-3.5 w-3.5" />AI-Powered Interview Practice
        </div>
        <h1 className="mb-6 max-w-4xl text-5xl font-extrabold uppercase leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>
          Master Your{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">Interview</span>
          {" "}with AI
        </h1>
        <p className="mb-10 max-w-xl text-lg leading-relaxed text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>
          Practice with AI interviewers that adapt to your answers in real time. Get instant, detailed feedback and land the role you deserve.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <PrimaryBtn onClick={() => onNavigate("interview")} className="flex items-center gap-2 px-9 py-4 text-base">
            <Play className="h-4 w-4" />Start Interview
          </PrimaryBtn>
          <OutlineBtn onClick={() => onNavigate("signup")} className="flex items-center gap-2 px-9 py-4 text-base">
            Create Free Account<ArrowRight className="h-4 w-4" />
          </OutlineBtn>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
          {[{ icon: Star, label: "4.9 rating", fill: true }, { icon: Users, label: "50,000+ users" }, { icon: CheckCircle, label: "Free to start" }].map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-indigo-400" />{label}</span>
          ))}
        </div>

        {/* AI Bot hero illustration */}
        <div className="relative mt-16 flex items-end justify-center gap-6">
          {/* Orbiting chips */}
          <div className="absolute -left-8 top-6 rounded-xl border border-indigo-500/25 bg-indigo-900/40 px-3 py-2 backdrop-blur-sm hidden sm:block">
            <p className="text-xs font-semibold text-indigo-300">Technical</p>
            <p className="text-[10px] text-slate-500">System Design</p>
          </div>
          <div className="absolute -right-8 top-6 rounded-xl border border-violet-500/25 bg-violet-900/40 px-3 py-2 backdrop-blur-sm hidden sm:block">
            <p className="text-xs font-semibold text-violet-300">Behavioural</p>
            <p className="text-[10px] text-slate-500">STAR Method</p>
          </div>
          <div className="absolute -bottom-4 left-0 rounded-xl border border-emerald-500/25 bg-emerald-900/30 px-3 py-2 backdrop-blur-sm hidden sm:block">
            <p className="flex items-center gap-1 text-xs font-semibold text-emerald-300"><CheckCircle className="h-3 w-3" />Score: 92%</p>
          </div>

          {/* Main bot */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-xl" />
            <div className="relative flex h-48 w-48 flex-col items-center justify-center rounded-[2rem] border border-indigo-500/25 bg-gradient-to-br from-indigo-900/60 to-violet-900/50 shadow-2xl shadow-indigo-500/20 backdrop-blur-md">
              <div className="absolute inset-0 rounded-[2rem] border border-indigo-500/15 animate-ping opacity-20" style={{ animationDuration: "3s" }} />
              <Bot className="h-24 w-24 text-indigo-300" strokeWidth={1.2} />
              <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400">AI</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
function Features() {
  const cards = [
    { icon: Mic, emoji: "🎙", title: "Voice Interview", desc: "Speak naturally. AI listens, transcribes, and evaluates verbal clarity and content in real time.", grad: "from-indigo-600 to-indigo-500", glow: "shadow-indigo-500/25" },
    { icon: Bot, emoji: "🤖", title: "Multiple Interviewers", desc: "Technical, HR, Product, Behavioural, and Customer Success AI personas — each with a distinct style.", grad: "from-violet-600 to-violet-500", glow: "shadow-violet-500/25" },
    { icon: Brain, emoji: "🧠", title: "Adaptive Questions", desc: "Questions evolve based on your responses and difficulty adjusts dynamically — just like a real interview.", grad: "from-purple-600 to-purple-500", glow: "shadow-purple-500/25" },
    { icon: BarChart3, emoji: "📊", title: "Instant Analytics", desc: "Detailed breakdowns across communication, technical depth, structure, and delivery after every session.", grad: "from-cyan-600 to-cyan-500", glow: "shadow-cyan-500/25" },
    { icon: Target, emoji: "🎯", title: "Role-Specific Prep", desc: "40+ roles covered: SWE, PM, Data Scientist, Designer, Customer Success, and many more.", grad: "from-emerald-600 to-emerald-500", glow: "shadow-emerald-500/25" },
    { icon: Shield, emoji: "🛡", title: "Company Simulations", desc: "Simulate interviews at Google, Meta, Amazon, Stripe, and 200+ other top companies.", grad: "from-amber-600 to-amber-500", glow: "shadow-amber-500/25" },
  ];
  return (
    <section className="relative px-6 py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-violet-600/6 blur-[100px]" />
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-indigo-400">Powerful Features</p>
          <h2 className="text-4xl font-extrabold text-white lg:text-5xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">succeed</span>
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ icon: Icon, emoji, title, desc, grad, glow }) => (
            <GlassCard key={title} className="group p-7">
              <div className={`mb-5 inline-flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} shadow-xl ${glow} transition-transform duration-300 group-hover:scale-110`} style={{ height: 52, width: 52 }}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <p className="mb-1 text-xl">{emoji}</p>
              <h3 className="mb-2 text-lg font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
              <p className="text-sm leading-relaxed text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>{desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── HowItWorks ────────────────────────────────────────────────────────────────
function HowItWorks({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const steps = [
    { num: "01", title: "Choose", desc: "Pick your interview type, role, experience level, and target company. We personalise everything." },
    { num: "02", title: "Interview", desc: "Answer questions from your AI interviewer by voice or text. It follows up and adapts in real time." },
    { num: "03", title: "Get Feedback", desc: "Receive instant, detailed feedback on structure, depth, clarity, and delivery after each answer." },
  ];
  return (
    <section className="relative px-6 py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/6 blur-[110px]" />
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-indigo-400">How It Works</p>
          <h2 className="text-4xl font-extrabold text-white lg:text-5xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Three steps to{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">interview-ready</span>
          </h2>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-0">
          {steps.map(({ num, title, desc }, i) => (
            <div key={num} className="flex flex-1 flex-col lg:flex-row">
              <GlassCard className="group relative flex-1 p-8 text-center lg:text-left" hover={false}>
                <span className="absolute right-6 top-4 select-none text-8xl font-extrabold text-white/[0.03]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{num}</span>
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xl font-extrabold text-white shadow-xl shadow-indigo-500/30 lg:mx-0">{num}</div>
                <h3 className="mb-2 text-2xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h3>
                <p className="text-sm leading-relaxed text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>{desc}</p>
              </GlassCard>
              {i < steps.length - 1 && (
                <div className="flex items-center justify-center py-4 lg:px-5 lg:py-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-500/30 bg-indigo-500/10">
                    <ArrowRight className="h-5 w-5 rotate-90 text-indigo-400 lg:rotate-0" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <PrimaryBtn onClick={() => onNavigate("interview")} className="inline-flex items-center gap-2 px-10 py-4 text-base">
            <Play className="h-4 w-4" />Start Practicing Now
          </PrimaryBtn>
        </div>
      </div>
    </section>
  );
}

// ── InterviewerRoles ──────────────────────────────────────────────────────────
function InterviewerRoles({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [active, setActive] = useState(0);
  const roles = [
    { id: "technical", label: "Technical", icon: Code2, grad: "from-indigo-600 to-indigo-500", color: "indigo", name: "Dr. Rohan Mehta", title: "Staff Engineer · 12 yrs", style: "Methodical. Expects structured reasoning and trade-off awareness.", qs: ["Design a distributed URL shortener at 100M req/day.", "Implement an LRU cache from scratch.", "Explain CAP theorem with a real-world example."], tags: ["Algorithms", "System Design", "Coding"] },
    { id: "hr", label: "HR", icon: HeartHandshake, grad: "from-rose-600 to-rose-500", color: "rose", name: "Sarah Williams", title: "Senior HR Partner · 8 yrs", style: "Warm but thorough. Focuses on culture fit and values alignment.", qs: ["Tell me about yourself and your career journey.", "Why do you want to work here?", "Where do you see yourself in five years?"], tags: ["Culture Fit", "Values", "Career Goals"] },
    { id: "product", label: "Product", icon: Layers, grad: "from-violet-600 to-violet-500", color: "violet", name: "Priya Nair", title: "Group PM · 10 yrs", style: "Data-driven. Wants to hear metrics and prioritisation logic.", qs: ["Walk me through a product you shipped end-to-end.", "How do you prioritise features with limited resources?", "How would you measure success for a new onboarding flow?"], tags: ["Strategy", "Metrics", "Roadmapping"] },
    { id: "customer", label: "Customer Success", icon: ShoppingBag, grad: "from-emerald-600 to-emerald-500", color: "emerald", name: "Marcus Lee", title: "CS Lead · 7 yrs", style: "Empathetic. Tests how you handle churn, escalations, and upsells.", qs: ["How do you handle an enterprise client threatening to churn?", "Describe your approach to building long-term relationships.", "How do you identify upsell opportunities without being pushy?"], tags: ["Retention", "Upselling", "Escalations"] },
    { id: "behavioural", label: "Behavioural", icon: MessageSquare, grad: "from-amber-600 to-amber-500", color: "amber", name: "Aisha Brooks", title: "Senior Recruiter · 9 yrs", style: "STAR-focused. Digs for specifics — no vague generalities accepted.", qs: ["Tell me about a time you failed and what you learned.", "Describe a conflict with a colleague and how you resolved it.", "Give an example of leading without formal authority."], tags: ["STAR Method", "Leadership", "Conflict"] },
  ];
  const r = roles[active];
  return (
    <section className="relative px-6 py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-violet-600/6 blur-[100px]" />
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-indigo-400">Meet Your AI Interviewers</p>
          <h2 className="text-4xl font-extrabold text-white lg:text-5xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Pick your{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">interviewer</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>Five distinct AI personas, each with a unique style and specialisation.</p>
        </div>
        {/* Tab pills */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {roles.map((role, i) => (
            <Chip key={role.id} active={active === i} color={role.color} onClick={() => setActive(i)}>{role.label}</Chip>
          ))}
        </div>
        {/* Detail card */}
        <GlassCard className="overflow-hidden" hover={false}>
          <div className={`h-1 w-full bg-gradient-to-r ${r.grad}`} />
          <div className="flex flex-col gap-8 p-8 lg:flex-row lg:items-start">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center lg:w-56 lg:flex-shrink-0">
              <div className={`mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${r.grad} shadow-2xl`}>
                <r.icon className="h-12 w-12 text-white" strokeWidth={1.5} />
              </div>
              <p className="text-lg font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{r.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">{r.title}</p>
              <p className="mt-3 text-xs italic leading-relaxed text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>"{r.style}"</p>
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {r.tags.map((t) => <Tag key={t} color={r.color}>{t}</Tag>)}
              </div>
            </div>
            <div className="hidden w-px self-stretch bg-white/8 lg:block" />
            {/* Questions */}
            <div className="flex-1">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-600">Sample Questions</p>
              <div className="flex flex-col gap-3 mb-8">
                {r.qs.map((q, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-xl border border-white/6 bg-white/3 p-4 transition-all hover:border-white/12 hover:bg-white/5">
                    <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${r.grad} text-xs font-bold text-white`}>{String(i + 1).padStart(2, "0")}</span>
                    <p className="text-sm leading-relaxed text-slate-300" style={{ fontFamily: "'Inter', sans-serif" }}>{q}</p>
                  </div>
                ))}
              </div>
              <PrimaryBtn onClick={() => onNavigate("interview")} className="flex items-center gap-2">
                <Play className="h-4 w-4" />Practice with {r.name.split(" ")[0]}
              </PrimaryBtn>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function Testimonials() {
  const items = [
    { name: "Jess Park", role: "SWE at Google", initials: "JP", grad: "from-indigo-500 to-violet-600", score: 94, quote: "After 2 weeks of daily practice with the Technical interviewer, I went from failing every system design to getting an offer from Google. The adaptive questions were exactly like the real thing.", stars: 5 },
    { name: "Marcus Chen", role: "PM at Stripe", initials: "MC", grad: "from-emerald-500 to-cyan-600", score: 89, quote: "The Product AI persona asked better questions than most humans I've interviewed with. It caught gaps in my prioritisation reasoning I didn't even know I had.", stars: 5 },
    { name: "Priya Agarwal", role: "DS at Meta", initials: "PA", grad: "from-violet-500 to-purple-600", score: 91, quote: "I used the Behavioural interviewer to prep my STAR answers. The feedback on my responses was brutally honest — and that made all the difference.", stars: 5 },
  ];
  return (
    <section className="relative px-6 py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-indigo-400">Testimonials</p>
          <h2 className="text-4xl font-extrabold text-white lg:text-5xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Trusted by{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">50,000+ candidates</span>
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map(({ name, role, initials, grad, score, quote, stars }) => (
            <GlassCard key={name} className="flex flex-col p-7">
              <Quote className="mb-4 h-7 w-7 text-indigo-500/40" />
              <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-300" style={{ fontFamily: "'Inter', sans-serif" }}>"{quote}"</p>
              <div className="flex items-center gap-3 border-t border-white/8 pt-5">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${grad} text-sm font-bold text-white`}>{initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{name}</p>
                  <p className="text-xs text-slate-500 truncate">{role}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold text-emerald-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{score}%</span>
                  <div className="flex gap-0.5">{Array(stars).fill(0).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTA({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 p-px">
          <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] px-10 py-16 text-center" style={{ background: "radial-gradient(ellipse at top center, rgba(99,102,241,0.18) 0%, rgba(5,13,31,0.96) 70%)" }}>
            <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[80px]" />
            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/30">
                <Bot className="h-8 w-8 text-white" strokeWidth={1.5} />
              </div>
              <h2 className="mb-4 text-4xl font-extrabold text-white lg:text-5xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ready to Practice Your Interview?</h2>
              <p className="mx-auto mb-10 max-w-lg text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>Join 50,000+ candidates who've sharpened their skills and landed roles at top companies. Free to start — no credit card needed.</p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <PrimaryBtn onClick={() => onNavigate("interview")} className="flex items-center gap-2 px-10 py-4 text-base"><Play className="h-4 w-4" />Start Interview</PrimaryBtn>
                <OutlineBtn onClick={() => onNavigate("signup")} className="px-10 py-4 text-base">Create Free Account</OutlineBtn>
              </div>
              <p className="mt-6 text-xs text-slate-700">No credit card required · Free forever plan available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH — components/auth/
// ═══════════════════════════════════════════════════════════════════════════════

// ── LoginForm ─────────────────────────────────────────────────────────────────
function LoginForm({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <GlassCard className="p-8" hover={false}>
      <div className="mb-6 flex flex-col gap-3">
        {[{ Icon: Chrome, label: "Continue with Google" }, { Icon: Github, label: "Continue with GitHub" }].map(({ Icon, label }) => (
          <button key={label} className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/8 hover:border-white/20"><Icon className="h-4 w-4" />{label}</button>
        ))}
      </div>
      <div className="mb-6 flex items-center gap-3"><div className="h-px flex-1 bg-white/10" /><span className="text-xs text-slate-600">or with email</span><div className="h-px flex-1 bg-white/10" /></div>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">Email</label>
          <div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-700 outline-none transition-all focus:border-indigo-500/60 focus:bg-white/8" style={{ fontFamily: "'Inter', sans-serif" }} /></div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between"><label className="text-xs font-semibold text-slate-400">Password</label><button className="text-xs text-indigo-400 hover:text-indigo-300">Forgot password?</button></div>
          <div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" /><input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-700 outline-none transition-all focus:border-indigo-500/60 focus:bg-white/8" style={{ fontFamily: "'Inter', sans-serif" }} /><button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"><Eye className="h-4 w-4" /></button></div>
        </div>
        <PrimaryBtn onClick={() => onNavigate("dashboard")} className="mt-2 w-full py-3.5">Sign In</PrimaryBtn>
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">Don't have an account?{" "}<button onClick={() => onNavigate("signup")} className="font-semibold text-indigo-400 hover:text-indigo-300">Sign up free</button></p>
    </GlassCard>
  );
}

// ── SignupForm ────────────────────────────────────────────────────────────────
function SignupForm({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <GlassCard className="p-8" hover={false}>
      <div className="mb-6 flex flex-col gap-3">
        {[{ Icon: Chrome, label: "Sign up with Google" }, { Icon: Github, label: "Sign up with GitHub" }].map(({ Icon, label }) => (
          <button key={label} className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/8 hover:border-white/20"><Icon className="h-4 w-4" />{label}</button>
        ))}
      </div>
      <div className="mb-6 flex items-center gap-3"><div className="h-px flex-1 bg-white/10" /><span className="text-xs text-slate-600">or with email</span><div className="h-px flex-1 bg-white/10" /></div>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">Full Name</label>
          <div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" /><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-700 outline-none transition-all focus:border-indigo-500/60 focus:bg-white/8" style={{ fontFamily: "'Inter', sans-serif" }} /></div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">Email</label>
          <div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-700 outline-none transition-all focus:border-indigo-500/60 focus:bg-white/8" style={{ fontFamily: "'Inter', sans-serif" }} /></div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-400">Password</label>
          <div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" /><input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-700 outline-none transition-all focus:border-indigo-500/60 focus:bg-white/8" style={{ fontFamily: "'Inter', sans-serif" }} /><button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"><Eye className="h-4 w-4" /></button></div>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-indigo-500/40"><div className="h-2 w-2 rounded-sm bg-indigo-500" /></div>
          <p className="text-xs leading-relaxed text-slate-500">I agree to the <a href="#" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a> and <a href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>.</p>
        </div>
        <PrimaryBtn onClick={() => onNavigate("dashboard")} className="mt-2 w-full py-3.5">Create Free Account</PrimaryBtn>
      </div>
      <p className="mt-6 text-center text-sm text-slate-500">Already have an account?{" "}<button onClick={() => onNavigate("login")} className="font-semibold text-indigo-400 hover:text-indigo-300">Sign in</button></p>
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD — components/dashboard/
// ═══════════════════════════════════════════════════════════════════════════════

// ── WelcomeCard ───────────────────────────────────────────────────────────────
function WelcomeCard({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/25 p-8" style={{ background: "radial-gradient(ellipse at left top, rgba(99,102,241,0.2) 0%, rgba(5,13,31,0.9) 60%)" }}>
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-violet-500/10 blur-[60px]" />
      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-400">Good morning 👋</p>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Welcome back, Alex!</h2>
          <p className="mt-2 text-sm text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>You're on a <span className="font-semibold text-amber-400">7-day streak</span>. Keep it up — consistency is key.</p>
        </div>
        <PrimaryBtn onClick={() => onNavigate("interview")} className="flex flex-shrink-0 items-center gap-2 self-start sm:self-auto">
          <Play className="h-4 w-4" />New Interview
        </PrimaryBtn>
      </div>
    </div>
  );
}

// ── InterviewCard (quick start) ───────────────────────────────────────────────
function InterviewCard({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const types = [
    { label: "Technical", icon: Code2, grad: "from-indigo-600 to-indigo-500" },
    { label: "HR Interview", icon: HeartHandshake, grad: "from-rose-600 to-rose-500" },
    { label: "Behavioural", icon: MessageSquare, grad: "from-amber-600 to-amber-500" },
    { label: "Product", icon: Layers, grad: "from-violet-600 to-violet-500" },
  ];
  return (
    <GlassCard className="p-6" hover={false}>
      <h3 className="mb-4 text-base font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Quick Start</h3>
      <div className="flex flex-col gap-2">
        {types.map(({ label, icon: Icon, grad }) => (
          <button key={label} onClick={() => onNavigate("interview")} className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3 text-left transition-all hover:border-indigo-500/30 hover:bg-white/8">
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${grad}`}><Icon className="h-4 w-4 text-white" /></div>
            <span className="flex-1 text-sm font-medium text-slate-300 group-hover:text-white">{label}</span>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

// ── ProgressCard ──────────────────────────────────────────────────────────────
function ProgressCard() {
  const bars = [
    { label: "Problem Solving", pct: 85 },
    { label: "Communication", pct: 78 },
    { label: "Technical Depth", pct: 72 },
    { label: "Behavioural", pct: 90 },
    { label: "System Design", pct: 65 },
  ];
  return (
    <GlassCard className="p-6" hover={false}>
      <h3 className="mb-5 text-base font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Skill Breakdown</h3>
      <div className="flex flex-col gap-4">
        {bars.map(({ label, pct }) => (
          <div key={label}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</span>
              <span className={`text-xs font-bold ${ScoreColor(pct)}`}>{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
              <div className={`h-full rounded-full bg-gradient-to-r ${BarColor(pct)}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── RecentInterviews ──────────────────────────────────────────────────────────
function RecentInterviews({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const rows = [
    { role: "Senior SWE", company: "Google", score: 88, date: "Today, 2:30 PM", type: "Technical", color: "indigo" },
    { role: "Staff Engineer", company: "Meta", score: 74, date: "Yesterday", type: "System Design", color: "emerald" },
    { role: "SWE II", company: "Stripe", score: 91, date: "Aug 17", type: "Behavioural", color: "amber" },
    { role: "Backend Eng", company: "Airbnb", score: 67, date: "Aug 15", type: "Technical", color: "indigo" },
  ];
  return (
    <GlassCard className="overflow-hidden" hover={false}>
      <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
        <h3 className="text-base font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent Interviews</h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300">View all</button>
      </div>
      <div className="divide-y divide-white/6">
        {rows.map(({ role, company, score, date, type, color }) => (
          <div key={`${role}-${company}`} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/8 text-sm font-bold text-white">{company[0]}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{role}</p>
              <p className="text-xs text-slate-500">{company} · {date}</p>
            </div>
            <Tag color={color as "indigo"}>{type}</Tag>
            <p className={`text-lg font-bold ${ScoreColor(score)}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{score}%</p>
            <button onClick={() => onNavigate("results")} className="text-slate-600 transition-colors hover:text-indigo-400"><Eye className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERVIEW — components/interview/
// ═══════════════════════════════════════════════════════════════════════════════

// ── RoleSelector ──────────────────────────────────────────────────────────────
function RoleSelector({ onStart }: { onStart: (r: SelectedRole) => void }) {
  const [selectedType, setSelectedType] = useState<InterviewerRole>("technical");
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel>("mid");
  const [selectedCompany, setSelectedCompany] = useState("Google");

  const types: { id: InterviewerRole; label: string; icon: typeof Code2; grad: string; color: string; desc: string }[] = [
    { id: "technical", label: "Technical", icon: Code2, grad: "from-indigo-600 to-indigo-500", color: "indigo", desc: "Algorithms, data structures, system design, coding challenges" },
    { id: "hr", label: "HR", icon: HeartHandshake, grad: "from-rose-600 to-rose-500", color: "rose", desc: "Culture fit, values alignment, career trajectory, salary" },
    { id: "product", label: "Product", icon: Layers, grad: "from-violet-600 to-violet-500", color: "violet", desc: "Product strategy, metrics, prioritisation, roadmapping" },
    { id: "customer", label: "Customer Success", icon: ShoppingBag, grad: "from-emerald-600 to-emerald-500", color: "emerald", desc: "Retention, escalations, upsells, long-term relationship building" },
    { id: "behavioural", label: "Behavioural", icon: MessageSquare, grad: "from-amber-600 to-amber-500", color: "amber", desc: "STAR method, leadership, conflict resolution, teamwork" },
  ];

  const levels: { id: ExperienceLevel; label: string; desc: string }[] = [
    { id: "junior", label: "Junior", desc: "0–2 yrs" },
    { id: "mid", label: "Mid-Level", desc: "2–5 yrs" },
    { id: "senior", label: "Senior", desc: "5–8 yrs" },
    { id: "staff", label: "Staff / Lead", desc: "8+ yrs" },
  ];

  const companies = ["Google", "Meta", "Amazon", "Microsoft", "Apple", "Stripe", "Airbnb", "Netflix", "Spotify", "Uber"];
  const sel = types.find((t) => t.id === selectedType)!;

  return (
    <div className="relative min-h-screen px-6 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/8 blur-[120px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-400">Configure Your Session</p>
          <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Choose your interview</h1>
          <p className="mt-2 text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>Customise the session to match your target role and company.</p>
        </div>

        {/* Interview type */}
        <GlassCard className="mb-5 p-6" hover={false}>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">Interview Type</h2>
          <div className="flex flex-col gap-3">
            {types.map(({ id, label, icon: Icon, grad, color, desc }) => (
              <button key={id} onClick={() => setSelectedType(id)} className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${selectedType === id ? "border-indigo-500/50 bg-indigo-500/10" : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/6"}`}>
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${grad} shadow-lg`}><Icon className="h-5 w-5 text-white" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-slate-500 truncate">{desc}</p>
                </div>
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedType === id ? "border-indigo-500 bg-indigo-500" : "border-white/20"}`}>
                  {selectedType === id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Experience level */}
        <GlassCard className="mb-5 p-6" hover={false}>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">Experience Level</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {levels.map(({ id, label, desc }) => (
              <button key={id} onClick={() => setSelectedLevel(id)} className={`rounded-xl border p-4 text-center transition-all duration-200 ${selectedLevel === id ? "border-indigo-500/50 bg-indigo-500/10" : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/6"}`}>
                <p className={`text-sm font-semibold ${selectedLevel === id ? "text-indigo-300" : "text-white"}`}>{label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Target company */}
        <GlassCard className="mb-8 p-6" hover={false}>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">Target Company</h2>
          <div className="flex flex-wrap gap-2">
            {companies.map((c) => (
              <button key={c} onClick={() => setSelectedCompany(c)} className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${selectedCompany === c ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-300" : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"}`}>{c}</button>
            ))}
          </div>
        </GlassCard>

        {/* Summary + Start */}
        <GlassCard className="p-6" hover={false}>
          <div className="mb-5 flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${sel.grad} shadow-xl flex-shrink-0`}><sel.icon className="h-6 w-6 text-white" /></div>
            <div>
              <p className="font-semibold text-white">{sel.label} Interview</p>
              <p className="text-xs text-slate-500">{selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} level · {selectedCompany} simulation</p>
            </div>
          </div>
          <PrimaryBtn onClick={() => onStart({ type: selectedType, level: selectedLevel, company: selectedCompany })} className="w-full flex items-center justify-center gap-2 py-4 text-base">
            <Play className="h-4 w-4" />Start Interview Session
          </PrimaryBtn>
        </GlassCard>
      </div>
    </div>
  );
}

// ── InterviewHeader ───────────────────────────────────────────────────────────
function InterviewHeader({ role, onEnd, muted, onMuteToggle }: { role: SelectedRole; onEnd: () => void; muted: boolean; onMuteToggle: () => void }) {
  const { formatted } = useTimer(true);
  return (
    <header className="relative z-10 border-b border-white/8 bg-[#050d1f]/80 px-6 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-white">AI Interviewer</span>
            <span className="ml-2 text-xs text-slate-600">·</span>
            <span className="ml-2 text-xs text-indigo-400">{role.type.charAt(0).toUpperCase() + role.type.slice(1)} · {role.company}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Timer running={true} />
          <button onClick={onMuteToggle} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:border-white/20 hover:text-white">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button onClick={onEnd} className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/20">
            <Phone className="h-3.5 w-3.5 rotate-[135deg]" />End
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Timer ─────────────────────────────────────────────────────────────────────
function Timer({ running }: { running: boolean }) {
  const { formatted } = useTimer(running);
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
      <Clock className="h-3.5 w-3.5 text-slate-400" />
      <span className="text-sm font-mono text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatted}</span>
    </div>
  );
}

// ── InterviewerCard ───────────────────────────────────────────────────────────
function InterviewerCard({ role }: { role: SelectedRole }) {
  const personas: Record<InterviewerRole, { name: string; title: string; icon: typeof Bot }> = {
    technical: { name: "Dr. Rohan Mehta", title: "Staff Engineer", icon: Code2 },
    hr: { name: "Sarah Williams", title: "Senior HR Partner", icon: HeartHandshake },
    product: { name: "Priya Nair", title: "Group PM", icon: Layers },
    customer: { name: "Marcus Lee", title: "CS Lead", icon: ShoppingBag },
    behavioural: { name: "Aisha Brooks", title: "Senior Recruiter", icon: MessageSquare },
  };
  const grads: Record<InterviewerRole, string> = {
    technical: "from-indigo-600 to-indigo-500",
    hr: "from-rose-600 to-rose-500",
    product: "from-violet-600 to-violet-500",
    customer: "from-emerald-600 to-emerald-500",
    behavioural: "from-amber-600 to-amber-500",
  };
  const p = personas[role.type];
  const Icon = p.icon;
  return (
    <GlassCard className="p-6 text-center" hover={false}>
      <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${grads[role.type]} shadow-2xl shadow-indigo-500/20`}>
        <Icon className="h-10 w-10 text-white" strokeWidth={1.5} />
      </div>
      <p className="font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.name}</p>
      <p className="mt-0.5 text-xs text-slate-500">{p.title}</p>
      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />Speaking
      </span>
    </GlassCard>
  );
}

// ── InterviewStatus ───────────────────────────────────────────────────────────
function InterviewStatus({ current, total }: { current: number; total: number }) {
  return (
    <GlassCard className="p-5" hover={false}>
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-600">Progress</p>
      <div className="flex gap-2 mb-2">
        {Array(total).fill(0).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < current ? "bg-emerald-400" : i === current ? "bg-indigo-500" : "bg-white/10"}`} />
        ))}
      </div>
      <p className="text-xs text-slate-500">Question {current + 1} of {total}</p>
    </GlassCard>
  );
}

// ── QuestionDisplay ───────────────────────────────────────────────────────────
function QuestionDisplay({ question, idx, hint }: { question: string; idx: number; hint: string }) {
  return (
    <div className="flex flex-col gap-4">
      <GlassCard className="p-6" hover={false}>
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-0.5 text-xs font-bold text-indigo-300">Q{idx + 1}</span>
        </div>
        <p className="text-base leading-relaxed text-slate-100" style={{ fontFamily: "'Inter', sans-serif" }}>{question}</p>
      </GlassCard>
      <GlassCard className="p-4" hover={false}>
        <div className="flex items-start gap-2.5">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
          <div>
            <p className="mb-1 text-xs font-bold text-amber-400">Hint</p>
            <p className="text-xs leading-relaxed text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>{hint}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ── VoiceWaveform ─────────────────────────────────────────────────────────────
function VoiceWaveform({ amplitude, recording }: { amplitude: number[]; recording: boolean }) {
  return (
    <div className="flex h-16 items-center justify-center gap-0.5">
      {amplitude.map((v, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-75 ${recording ? "bg-gradient-to-t from-indigo-600 to-violet-400" : "bg-white/15"}`}
          style={{ height: `${Math.max(4, v * 48)}px` }}
        />
      ))}
    </div>
  );
}

// ── MicButton ─────────────────────────────────────────────────────────────────
function MicButton({ recording, onClick }: { recording: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${recording ? "bg-rose-600 shadow-lg shadow-rose-500/40 hover:bg-rose-500" : "bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/40 hover:from-indigo-500 hover:to-violet-500"}`}>
      {recording && <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/40" />}
      {recording ? <MicOff className="h-7 w-7 text-white" /> : <Mic className="h-7 w-7 text-white" />}
    </button>
  );
}

// ── ConversationBox ───────────────────────────────────────────────────────────
function ConversationBox({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);
  return (
    <div className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
      {messages.map((m, i) => (
        <div key={i} className={`flex gap-3 ${m.speaker === "user" ? "flex-row-reverse" : ""}`}>
          <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${m.speaker === "user" ? "bg-gradient-to-br from-indigo-600 to-violet-600" : "bg-white/10"}`}>
            {m.speaker === "user" ? "Y" : "AI"}
          </div>
          <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.speaker === "user" ? "rounded-tr-sm border border-indigo-500/20 bg-indigo-600/15" : "rounded-tl-sm border border-white/8 bg-white/5"}`}>
            <p className="text-sm leading-relaxed text-slate-200" style={{ fontFamily: "'Inter', sans-serif" }}>{m.text}</p>
            <p className="mt-1 text-[10px] text-slate-600">{m.ts}</p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

// ── InterviewControls ─────────────────────────────────────────────────────────
function InterviewControls({ onSkip, onEnd }: { onSkip: () => void; onEnd: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onSkip} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:border-white/20 hover:text-white">
        <SkipForward className="h-3.5 w-3.5" />Skip
      </button>
      <button onClick={onEnd} className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-400 transition-all hover:bg-rose-500/20">
        <X className="h-3.5 w-3.5" />End Session
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS — components/results/
// ═══════════════════════════════════════════════════════════════════════════════

// ── ScoreCard ─────────────────────────────────────────────────────────────────
function ScoreCard({ score }: { score: number }) {
  const r = 60;
  const circ = 2 * Math.PI * r;
  return (
    <GlassCard className="p-8" hover={false}>
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative flex-shrink-0">
          <svg className="h-40 w-40 -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle cx="70" cy="70" r={r} fill="none" stroke="url(#sg)" strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)} />
            <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{score}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300"><Award className="h-3 w-3" />Technical · Google Simulation</span>
          <h2 className="mt-2 text-3xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {score >= 85 ? "Excellent Performance!" : score >= 70 ? "Solid Performance" : "Keep Practicing"}
          </h2>
          <p className="mt-2 text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>
            You scored in the <span className="font-semibold text-indigo-300">{score >= 85 ? "top 15%" : score >= 70 ? "top 35%" : "top 60%"}</span> of candidates for this role.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />28 min</span>
            <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" />3 questions</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-400" />Aug 19, 2025</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ── PerformanceChart ──────────────────────────────────────────────────────────
function PerformanceChart() {
  const radarData = [
    { subject: "Problem\nSolving", A: 85, fullMark: 100 },
    { subject: "Comm.", A: 78, fullMark: 100 },
    { subject: "Technical\nDepth", A: 72, fullMark: 100 },
    { subject: "Structure", A: 88, fullMark: 100 },
    { subject: "Trade-offs", A: 80, fullMark: 100 },
  ];
  const barData = [
    { name: "Prev", score: 61 },
    { name: "Week 1", score: 68 },
    { name: "Week 2", score: 74 },
    { name: "Week 3", score: 79 },
    { name: "Today", score: 81 },
  ];
  return (
    <GlassCard className="p-6" hover={false}>
      <h3 className="mb-6 text-base font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Performance Overview</h3>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-600">Skill Radar</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
              <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-600">Score Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barCategoryGap="30%">
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip contentStyle={{ background: "#0d1634", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 12, color: "#fff", fontSize: 12 }} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
              <Bar dataKey="score" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}

// ── SkillAnalysis ─────────────────────────────────────────────────────────────
function SkillAnalysis() {
  const cats = [
    { label: "Problem Solving", score: 85 },
    { label: "Communication", score: 78 },
    { label: "Technical Depth", score: 72 },
    { label: "Structured Thinking", score: 88 },
    { label: "Trade-off Analysis", score: 80 },
  ];
  return (
    <GlassCard className="p-6" hover={false}>
      <h3 className="mb-5 text-base font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Category Scores</h3>
      <div className="flex flex-col gap-4">
        {cats.map(({ label, score }) => (
          <div key={label}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</span>
              <span className={`text-sm font-bold ${ScoreColor(score)}`}>{score}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div className={`h-full rounded-full bg-gradient-to-r ${BarColor(score)}`} style={{ width: `${score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// ── FeedbackCard ──────────────────────────────────────────────────────────────
function FeedbackCard() {
  const strengths = [
    "Clear problem decomposition — great system-level breakdown.",
    "Excellent trade-off articulation for the database choice.",
    "Confident communication and steady pacing throughout.",
  ];
  const improvements = [
    "Discuss caching strategies earlier in your response.",
    "Quantify estimates (QPS, storage) to demonstrate depth.",
    "Explore failure scenarios and recovery strategies.",
  ];
  return (
    <div className="flex flex-col gap-4">
      <GlassCard className="p-6" hover={false}>
        <div className="mb-4 flex items-center gap-2"><ThumbsUp className="h-4 w-4 text-emerald-400" /><h3 className="font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Strengths</h3></div>
        <ul className="flex flex-col gap-3">
          {strengths.map((s) => (
            <li key={s} className="flex items-start gap-2.5">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
              <span className="text-xs leading-relaxed text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>{s}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
      <GlassCard className="p-6" hover={false}>
        <div className="mb-4 flex items-center gap-2"><ThumbsDown className="h-4 w-4 text-amber-400" /><h3 className="font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Areas to Improve</h3></div>
        <ul className="flex flex-col gap-3">
          {improvements.map((s) => (
            <li key={s} className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
              <span className="text-xs leading-relaxed text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>{s}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}

// ── ImprovementTips ───────────────────────────────────────────────────────────
function ImprovementTips({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const tips = [
    { title: "Practice System Design", desc: "Spend 20 minutes daily sketching distributed architectures on paper before explaining them.", icon: Layers, color: "indigo" },
    { title: "Quantify Everything", desc: "Always attach numbers to your claims: throughput, latency, storage. Interviewers reward specificity.", icon: BarChart3, color: "cyan" },
    { title: "Use STAR More Rigorously", desc: "For every behavioural answer, run through STAR mentally before speaking. Aim for 2-min responses.", icon: Target, color: "violet" },
  ];
  const grads: Record<string, string> = { indigo: "from-indigo-600 to-indigo-500", cyan: "from-cyan-600 to-cyan-500", violet: "from-violet-600 to-violet-500" };
  return (
    <GlassCard className="overflow-hidden" hover={false}>
      <div className="border-b border-white/8 px-6 py-4">
        <h3 className="text-base font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Improvement Tips</h3>
        <p className="mt-0.5 text-xs text-slate-500">Personalised based on your session performance.</p>
      </div>
      <div className="flex flex-col divide-y divide-white/6">
        {tips.map(({ title, desc, icon: Icon, color }) => (
          <div key={title} className="flex items-start gap-4 p-5 transition-colors hover:bg-white/3">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${grads[color]} shadow-lg`}><Icon className="h-5 w-5 text-white" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>{desc}</p>
            </div>
          </div>
        ))}
        <div className="p-5">
          <PrimaryBtn onClick={() => onNavigate("interview")} className="w-full flex items-center justify-center gap-2 py-3">
            <RotateCcw className="h-4 w-4" />Practice Again
          </PrimaryBtn>
        </div>
      </div>
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════════════════

// ── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <>
      <Hero onNavigate={onNavigate} />
      <Features />
      <HowItWorks onNavigate={onNavigate} />
      <InterviewerRoles onNavigate={onNavigate} />
      <Testimonials />
      <CTA onNavigate={onNavigate} />
      <Footer onNavigate={onNavigate} />
    </>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────
function LoginPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/12 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-600/10 blur-[80px]" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <button onClick={() => onNavigate("landing")} className="mb-6 inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30"><Bot className="h-5 w-5 text-white" /></div>
            <span className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI Interviewer</span>
          </button>
          <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Welcome back</h1>
          <p className="mt-2 text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>Sign in to continue your practice sessions</p>
        </div>
        <LoginForm onNavigate={onNavigate} />
      </div>
    </div>
  );
}

// ── Signup Page ───────────────────────────────────────────────────────────────
function SignupPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/12 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-indigo-600/10 blur-[80px]" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <button onClick={() => onNavigate("landing")} className="mb-6 inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30"><Bot className="h-5 w-5 text-white" /></div>
            <span className="text-sm font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI Interviewer</span>
          </button>
          <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Create your account</h1>
          <p className="mt-2 text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>Start your interview preparation journey today</p>
        </div>
        <SignupForm onNavigate={onNavigate} />
      </div>
    </div>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────────
function DashboardPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const stats = [
    { label: "Interviews Done", value: "24", change: "+3 this week", icon: FileText, grad: "from-indigo-600 to-indigo-500" },
    { label: "Avg. Score", value: "81%", change: "+4% last week", icon: TrendingUp, grad: "from-emerald-600 to-emerald-500" },
    { label: "Hours Practiced", value: "18.5h", change: "+2.5h this week", icon: Clock, grad: "from-violet-600 to-violet-500" },
    { label: "Day Streak", value: "7 days", change: "Personal best!", icon: Zap, grad: "from-amber-600 to-amber-500" },
  ];
  return (
    <div className="flex min-h-screen">
      <Sidebar onNavigate={onNavigate} activePage="dashboard" />
      <main className="flex-1 px-6 py-8 lg:ml-64">
        <div className="mx-auto max-w-5xl space-y-6">
          <WelcomeCard onNavigate={onNavigate} />
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, value, change, icon: Icon, grad }) => (
              <GlassCard key={label} className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${grad}`}><Icon className="h-4 w-4 text-white" /></div>
                </div>
                <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</p>
                <p className="mt-1 text-xs text-emerald-400">{change}</p>
              </GlassCard>
            ))}
          </div>
          {/* Mid */}
          <div className="grid gap-6 lg:grid-cols-3">
            <InterviewCard onNavigate={onNavigate} />
            <div className="lg:col-span-2"><ProgressCard /></div>
          </div>
          <RecentInterviews onNavigate={onNavigate} />
        </div>
      </main>
    </div>
  );
}

// ── Interview Page ────────────────────────────────────────────────────────────
function InterviewPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [step, setStep] = useState<InterviewStep>("role-select");
  const [role, setRole] = useState<SelectedRole>({ type: "technical", level: "mid", company: "Google" });
  const [qIdx, setQIdx] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [muted, setMuted] = useState(false);
  const { recording, amplitude, toggle: toggleMic } = useVoice();

  const questions = [
    { q: "Can you walk me through how you would design a URL shortening service like Bit.ly? Consider scalability to handle 100 million daily requests and discuss the trade-offs in your approach.", hint: "DB choice, hashing strategy, caching, load balancing" },
    { q: "Tell me about a time you had to make a critical technical decision under significant time pressure. What was your process and outcome?", hint: "Use STAR: Situation, Task, Action, Result" },
    { q: "Explain horizontal vs vertical scaling. When would you choose one over the other, and what are the key limitations of each?", hint: "Think about cost, complexity, and specific use cases" },
  ];

  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleStart = (r: SelectedRole) => {
    setRole(r);
    setMessages([{ speaker: "ai", text: questions[0].q, ts: now() }]);
    setStep("session");
  };

  const sendMessage = () => {
    if (!draft.trim()) return;
    const userMsg: Message = { speaker: "user", text: draft, ts: now() };
    const aiReply: Message = { speaker: "ai", text: "Good response! You covered the high-level architecture well. Let me ask you a follow-up — what's next for us?", ts: now() };
    setMessages((m) => [...m, userMsg, aiReply]);
    setDraft("");
  };

  const handleNext = () => {
    if (qIdx < questions.length - 1) {
      const next = qIdx + 1;
      setQIdx(next);
      setMessages((m) => [...m, { speaker: "ai", text: questions[next].q, ts: now() }]);
    } else {
      onNavigate("results");
    }
  };

  if (step === "role-select") return <RoleSelector onStart={handleStart} />;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0"><div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/8 blur-[100px]" /></div>
      <InterviewHeader role={role} onEnd={() => onNavigate("results")} muted={muted} onMuteToggle={() => setMuted(!muted)} />
      <div className="relative z-10 flex flex-1 flex-col gap-5 p-5">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 lg:flex-row">
          {/* Left panel */}
          <div className="flex flex-col gap-4 lg:w-72">
            <InterviewerCard role={role} />
            <InterviewStatus current={qIdx} total={questions.length} />
            <QuestionDisplay question={questions[qIdx].q} idx={qIdx} hint={questions[qIdx].hint} />
          </div>
          {/* Right panel */}
          <div className="flex flex-1 flex-col gap-4">
            {/* Conversation */}
            <GlassCard className="flex flex-1 flex-col p-6" hover={false}>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-600">Conversation</p>
              <div className="flex-1"><ConversationBox messages={messages} /></div>
              {/* Waveform */}
              <div className="my-4 rounded-xl border border-white/8 bg-white/4 px-4 py-3">
                <VoiceWaveform amplitude={amplitude} recording={recording} />
                <p className="mt-1 text-center text-[10px] text-slate-600">{recording ? "Listening… tap mic to stop" : "Tap mic to speak, or type below"}</p>
              </div>
              {/* Text input */}
              <div className="flex items-end gap-3">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type your answer… (Enter to send, Shift+Enter for newline)"
                  rows={3}
                  className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 placeholder-slate-700 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/8"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                <div className="flex flex-col items-center gap-2">
                  <MicButton recording={recording} onClick={toggleMic} />
                  <button onClick={sendMessage} disabled={!draft.trim()} className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white transition-all hover:bg-indigo-500 disabled:opacity-40">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
            {/* Controls */}
            <div className="flex items-center justify-between">
              <InterviewControls onSkip={handleNext} onEnd={() => onNavigate("results")} />
              <PrimaryBtn onClick={handleNext} className="flex items-center gap-2 py-2.5 text-sm">
                {qIdx < questions.length - 1 ? "Next Question" : "View Results"}
                <ArrowRight className="h-4 w-4" />
              </PrimaryBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Results Page ──────────────────────────────────────────────────────────────
function ResultsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const overall = 81;
  const transcript: Message[] = [
    { speaker: "ai", text: "Can you walk me through how you would design a URL shortening service like Bit.ly?", ts: "2:31 PM" },
    { speaker: "user", text: "Sure! I'd start by clarifying requirements — we need to shorten URLs, handle redirects, and scale to 100M daily requests. For storage, I'd use Cassandra for write throughput with a Redis cache layer for hot URLs...", ts: "2:32 PM" },
    { speaker: "ai", text: "How would you handle hash collisions in your URL generation strategy?", ts: "2:35 PM" },
    { speaker: "user", text: "I'd use base-62 encoding on an auto-incremented ID to avoid collisions entirely, rather than random hashing — giving us predictable, unique short codes...", ts: "2:36 PM" },
  ];
  return (
    <div className="relative min-h-screen px-6 py-12">
      <div className="pointer-events-none absolute inset-0"><div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/8 blur-[120px]" /></div>
      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button onClick={() => onNavigate("dashboard")} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600"><Bot className="h-4 w-4 text-white" /></div>
            <span className="text-xs font-bold uppercase tracking-widest text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI Interviewer</span>
          </button>
          <div className="flex gap-3">
            <OutlineBtn onClick={() => onNavigate("interview")} className="flex items-center gap-2 py-2 text-sm"><RotateCcw className="h-4 w-4" />Retake</OutlineBtn>
            <PrimaryBtn onClick={() => onNavigate("dashboard")} className="flex items-center gap-2 py-2 text-sm"><Home className="h-4 w-4" />Dashboard</PrimaryBtn>
          </div>
        </div>
        <div className="space-y-6">
          <ScoreCard score={overall} />
          <PerformanceChart />
          <div className="grid gap-6 lg:grid-cols-2">
            <SkillAnalysis />
            <FeedbackCard />
          </div>
          <ImprovementTips onNavigate={onNavigate} />
          {/* Transcript */}
          <GlassCard className="overflow-hidden" hover={false}>
            <div className="border-b border-white/8 px-6 py-4">
              <h3 className="text-base font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Interview Transcript</h3>
            </div>
            <div className="p-6"><ConversationBox messages={transcript} /></div>
          </GlassCard>
          {/* Bottom CTA */}
          <div className="flex flex-col items-center gap-4 pb-4 sm:flex-row sm:justify-center">
            <PrimaryBtn onClick={() => onNavigate("interview")} className="flex items-center gap-2 px-9 py-3.5"><RotateCcw className="h-4 w-4" />Practice Again</PrimaryBtn>
            <OutlineBtn onClick={() => onNavigate("dashboard")} className="flex items-center gap-2 px-9 py-3.5"><BarChart3 className="h-4 w-4" />View All Progress</OutlineBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP ROOT (router)
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const navigate = (p: Page) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {page === "landing" && <Navbar onNavigate={navigate} />}
      {page === "landing" && <LandingPage onNavigate={navigate} />}
      {page === "login" && <LoginPage onNavigate={navigate} />}
      {page === "signup" && <SignupPage onNavigate={navigate} />}
      {page === "dashboard" && <DashboardPage onNavigate={navigate} />}
      {page === "interview" && <InterviewPage onNavigate={navigate} />}
      {page === "results" && <ResultsPage onNavigate={navigate} />}
    </div>
  );
}

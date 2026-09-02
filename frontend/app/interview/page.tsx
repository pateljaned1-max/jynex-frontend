'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MoreHorizontal,
  PhoneOff,
  Clock,
  Sparkles,
  Bot,
  LineChart,
  HelpCircle,
  FileText,
  Settings,
  ShieldAlert,
  ArrowRight,
  Code2,
  UserCheck,
  Briefcase,
  Zap,
  Activity,
  MessageSquare,
  Smile,
  Volume2
} from 'lucide-react';

export default function InterviewRoomPage() {
  const router = useRouter();

  // Call Controls State
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeAgent, setActiveAgent] = useState<'alex' | 'sarah' | 'emma'>('alex');

  // Timer State (12:45 countdown)
  const [secondsLeft, setSecondsLeft] = useState(12 * 60 + 45);

  // Dynamic Question state
  const [currentQuestion, setCurrentQuestion] = useState(
    "Let's talk about the virtual DOM in React. How does it improve performance?"
  );

  // Canvas visualizer ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sine wave audio visualizer effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isMuted) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Cyan main wave
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#06b6d4';
        const height = canvas.height;
        const width = canvas.width;

        ctx.moveTo(0, height / 2);
        for (let i = 0; i < width; i++) {
          const wave1 = Math.sin(i * 0.05 + step * 0.1) * 10;
          const wave2 = Math.cos(i * 0.02 + step * 0.06) * 5;
          ctx.lineTo(i, height / 2 + wave1 + wave2);
        }
        ctx.stroke();

        // Purple secondary wave
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.moveTo(0, height / 2);
        for (let i = 0; i < width; i++) {
          const wave = Math.cos(i * 0.04 + step * 0.08) * 8;
          ctx.lineTo(i, height / 2 + wave);
        }
        ctx.stroke();

        step++;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMuted]);

  const nextQuestionsPool = [
    "Can you explain how indexing works in MongoDB and when you should use a compound index?",
    "How do you handle rate limiting in a microservices backend built with Node/Python?",
    "Describe a challenging bug you diagnosed and solved under tight production deadlines."
  ];

  const handleNextQuestion = () => {
    const nextQ = nextQuestionsPool[Math.floor(Math.random() * nextQuestionsPool.length)];
    setCurrentQuestion(nextQ);
  };

  return (
    <div className="h-screen w-screen bg-[#040711] text-slate-200 font-sans flex flex-col overflow-hidden selection:bg-cyan-500 selection:text-white">
      
      {/* 1. TOP BAR */}
      <header className="h-14 border-b border-slate-800/80 bg-[#060a17]/95 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-cyan-500/20">
              <Sparkles size={16} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Interview<span className="text-cyan-400">AI</span>
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800" />

          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Live Interview
          </div>
        </div>

        {/* Center Countdown Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-300 font-mono text-sm bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
            <Clock size={15} className="text-cyan-400" />
            <span className="font-bold text-white tracking-wider">{formatTime(secondsLeft)}</span>
            <span className="text-xs text-slate-500">Remaining</span>
          </div>

          {/* Audio Wave Header Indicator */}
          <div className="flex items-center gap-1 h-5 px-2">
            <div className="w-1 bg-cyan-400 rounded-full h-3 animate-pulse" />
            <div className="w-1 bg-purple-400 rounded-full h-5 animate-pulse" />
            <div className="w-1 bg-blue-400 rounded-full h-4 animate-pulse" />
            <div className="w-1 bg-cyan-400 rounded-full h-2 animate-pulse" />
          </div>
        </div>

        <button
          onClick={() => router.push('/results')}
          className="bg-rose-600/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 px-4 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-rose-600/10"
        >
          <PhoneOff size={14} /> End Interview
        </button>
      </header>

      {/* 2. MAIN BODY VIEW */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT NAV SIDEBAR */}
        <aside className="w-56 border-r border-slate-800/80 bg-[#060914] p-4 flex flex-col justify-between shrink-0 hidden lg:flex">
          <nav className="space-y-1.5">
            <Link href="/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition text-xs font-medium">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <Link href="/interview" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold shadow-lg shadow-cyan-500/5">
              <Video size={16} className="text-cyan-400" /> Interview Room
            </Link>
            <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition text-xs font-medium">
              <Bot size={16} /> AI Agents
            </a>
            <Link href="/results" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition text-xs font-medium">
              <LineChart size={16} /> Analysis
            </Link>
            <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition text-xs font-medium">
              <HelpCircle size={16} /> Questions
            </a>
            <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition text-xs font-medium">
              <FileText size={16} /> Reports
            </a>
            <Link href="/profile" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition text-xs font-medium">
              <Settings size={16} /> Settings
            </Link>
          </nav>

          <div className="space-y-3">
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Interview ID</span>
              <span className="text-xs font-mono font-medium text-slate-300">INT-2026-09-03-001</span>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-200 text-xs transition">
              <ShieldAlert size={14} className="text-slate-500" /> Report an Issue
            </button>
          </div>
        </aside>

        {/* CENTER INTERVIEW ROOM & AI COLLABORATION */}
        <main className="flex-1 p-5 overflow-y-auto flex flex-col gap-5 bg-gradient-to-b from-[#060a16] via-[#050812] to-[#03050c]">
          
          {/* AI AGENT TILES HEADER */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Bot size={15} className="text-cyan-400" />
                <span>AI Interview Panel & Collaboration</span>
              </div>
              <span className="text-[11px] text-slate-500">Tap an AI agent to inspect live state</span>
            </div>

            {/* 3 AI AGENTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* ALEX - Technical AI */}
              <div
                onClick={() => setActiveAgent('alex')}
                className={`rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden ${
                  activeAgent === 'alex'
                    ? 'bg-gradient-to-br from-slate-900/90 via-slate-950 to-[#071329] border border-cyan-400/50 shadow-xl shadow-cyan-500/10'
                    : 'bg-slate-900/40 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500" />

                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                          alt="Alex"
                          className="w-full h-full object-cover rounded-[14px]"
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full flex items-center justify-center">
                        <Volume2 size={9} className="text-slate-950" />
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-white text-base">Alex</h3>
                      <p className="text-xs text-cyan-400 font-medium">Technical AI Agent</p>
                      
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Asking Question
                      </div>
                    </div>
                  </div>

                  {/* Focus Areas */}
                  <div className="mb-3">
                    <span className="text-[10px] text-slate-400 font-semibold block mb-1">Focus Areas</span>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">• React</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">• Python</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">• JavaScript</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">• Problem Solving</span>
                    </div>
                  </div>

                  {/* Current Activity Box */}
                  <div className="bg-slate-950/80 border border-cyan-500/20 rounded-xl p-3">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-1">Current Activity</span>
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      "{currentQuestion}"
                    </p>
                  </div>
                </div>

                {/* Animated Spectrum Wave */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Live Voice Spectrum</span>
                  <div className="flex items-center gap-1 h-3.5">
                    <span className="w-1 bg-cyan-400 rounded-full h-full animate-bounce" />
                    <span className="w-1 bg-cyan-400 rounded-full h-2 animate-bounce" />
                    <span className="w-1 bg-cyan-400 rounded-full h-3 animate-bounce" />
                    <span className="w-1 bg-cyan-400 rounded-full h-1.5 animate-bounce" />
                    <span className="w-1 bg-cyan-400 rounded-full h-full animate-bounce" />
                  </div>
                </div>
              </div>

              {/* SARAH - Hiring Manager AI */}
              <div
                onClick={() => setActiveAgent('sarah')}
                className={`rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden ${
                  activeAgent === 'sarah'
                    ? 'bg-gradient-to-br from-slate-900/90 via-slate-950 to-[#1f170a] border border-amber-400/50 shadow-xl shadow-amber-500/10'
                    : 'bg-slate-900/40 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-orange-500 opacity-60" />

                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-600 p-0.5">
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                        alt="Sarah"
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-white text-base">Sarah</h3>
                      <p className="text-xs text-amber-400 font-medium">Hiring Manager AI</p>
                      
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Analyzing
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-[10px] text-slate-400 font-semibold block mb-1">Focus Areas</span>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">• Leadership</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">• Experience</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">• Decision Making</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-1">Current Insight</span>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "Candidate has good technical knowledge and clear communication."
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Evaluating System Architecture...</span>
                  <Activity size={13} className="text-amber-400/70 animate-pulse" />
                </div>
              </div>

              {/* EMMA - Behavioural AI */}
              <div
                onClick={() => setActiveAgent('emma')}
                className={`rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden ${
                  activeAgent === 'emma'
                    ? 'bg-gradient-to-br from-slate-900/90 via-slate-950 to-[#1b0d2d] border border-purple-400/50 shadow-xl shadow-purple-500/10'
                    : 'bg-slate-900/40 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-400 to-pink-500 opacity-50" />

                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-400 to-indigo-600 p-0.5">
                      <img
                        src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80"
                        alt="Emma"
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-white text-base">Emma</h3>
                      <p className="text-xs text-purple-400 font-medium">Behavioural AI Agent</p>
                      
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        Waiting
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-[10px] text-slate-400 font-semibold block mb-1">Focus Areas</span>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">• Communication</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">• Confidence</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">• Teamwork</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">• Adaptability</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-1">Current Observation</span>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      "Listening to responses... evaluating confidence and clarity."
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Standby Evaluation</span>
                  <Sparkles size={13} className="text-purple-400/60" />
                </div>
              </div>

            </div>
          </section>

          {/* AGENT COLLABORATION DECISION WORKFLOW */}
          <section className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Zap size={14} className="text-purple-400" />
                <span>Agent Collaboration System</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                Shared Neural Context
              </span>
            </div>

            {/* Pipeline Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-950/90 border border-cyan-500/30 p-3 rounded-xl flex items-start gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Code2 size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Technical AI (Alex)</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Candidate performed well in JavaScript and answered correctly.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/90 border border-purple-500/30 p-3 rounded-xl flex items-start gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <UserCheck size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Behavioural AI (Emma)</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Confidence is high, but the candidate should provide more real-world examples.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/90 border border-amber-500/30 p-3 rounded-xl flex items-start gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Briefcase size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Hiring Manager AI (Sarah)</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Based on previous responses, increase the difficulty of the next question.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Decision Box */}
            <div className="bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-blue-950/40 border border-cyan-500/30 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wide">
                <Zap size={14} className="animate-pulse text-cyan-400" />
                <span>AI Collaboration Decision</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                Based on combined analysis from all AI agents, the next question difficulty has been increased.
              </p>
            </div>

            {/* Next Question CTA Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-3.5 flex items-center justify-between text-white shadow-xl shadow-indigo-600/20">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200 block">NEXT QUESTION GENERATED</span>
                <span className="text-xs font-semibold text-white">Difficulty Level: Medium → <strong className="text-amber-300">Hard</strong></span>
              </div>
              <button
                onClick={handleNextQuestion}
                className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition active:scale-95 shadow-md"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </section>

        </main>

        {/* RIGHT SIDEBAR (LIVE ANALYSIS & INFO) */}
        <aside className="w-80 border-l border-slate-800/80 bg-[#060914] p-4 flex flex-col justify-between shrink-0 overflow-y-auto hidden xl:flex space-y-4">
          
          {/* LIVE ANALYSIS METRICS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" /> Live Analysis
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Score 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-cyan-400" /> Communication
                </span>
                <span className="font-bold text-white">85%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full w-[85%]" />
              </div>
            </div>

            {/* Score 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Code2 size={13} className="text-blue-400" /> Technical Skills
                </span>
                <span className="font-bold text-white">78%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-[78%]" />
              </div>
            </div>

            {/* Score 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-purple-400" /> Confidence
                </span>
                <span className="font-bold text-white">92%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-[92%]" />
              </div>
            </div>

            {/* Score 4 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-400" /> Problem Solving
                </span>
                <span className="font-bold text-white">80%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full w-[80%]" />
              </div>
            </div>

            {/* Mini Cards */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Filler Words</span>
                <span className="text-sm font-bold text-white">~ 3</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Speaking Pace</span>
                <span className="text-sm font-bold text-white">~ 138 WPM</span>
              </div>
            </div>

            {/* Emotion Detection */}
            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Emotion Status</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Smile size={14} /> Calm & Focused
              </span>
            </div>
          </div>

          {/* INTERVIEW INFO TABLE */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Interview Details
            </span>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Candidate</span>
                <span className="font-semibold text-white">John Doe</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Role</span>
                <span className="font-semibold text-white">Full Stack Developer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Experience</span>
                <span className="font-semibold text-white">2+ Years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Round</span>
                <span className="font-semibold text-white">Technical + HR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Started At</span>
                <span className="font-semibold text-white">10:30 AM</span>
              </div>
            </div>
          </div>

          {/* VOICE ACTIVITY LIVE WAVE */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
              <span className="flex items-center gap-1.5"><Mic size={14} className="text-cyan-400" /> Voice Activity</span>
              <span className={`text-[10px] ${isMuted ? 'text-rose-400' : 'text-cyan-400'}`}>
                {isMuted ? 'Muted' : 'Listening...'}
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex flex-col items-center justify-center">
              <canvas ref={canvasRef} width={260} height={40} className="w-full h-10" />
              <span className="text-[11px] text-slate-400 italic text-center mt-1">
                {isMuted ? 'Microphone is turned off' : 'You are speaking...'}
              </span>
            </div>
          </div>

        </aside>

      </div>

      {/* 3. BOTTOM CALL CONTROLS DOCK */}
      <footer className="h-16 border-t border-slate-800 bg-[#060a17]/95 px-6 flex items-center justify-between shrink-0 z-20">
        
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          <span className="text-xs text-slate-300 font-medium">Connection:</span>
          <span className="text-xs text-emerald-400 font-bold">Stable (32ms)</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Mic */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition border shadow-lg ${
              isMuted
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
            }`}
          >
            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* Video */}
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition border shadow-lg ${
              isVideoOff
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-rose-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
            }`}
          >
            {isVideoOff ? <VideoOff size={16} /> : <Video size={16} />}
          </button>

          {/* Screen Share */}
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition border shadow-lg ${
              isScreenSharing
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 shadow-cyan-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <MonitorUp size={16} />
          </button>

          {/* More Settings */}
          <button className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition border border-slate-700 shadow-lg">
            <MoreHorizontal size={16} />
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono hidden sm:block">
          Jynex Neural Stream v2.4
        </div>
      </footer>

    </div>
  );
}
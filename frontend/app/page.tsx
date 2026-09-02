'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mic,
  Zap,
  Bot,
  BarChart3,
  Shield,
  Clock,
  ArrowRight,
  Play,
  Moon,
  Sun,
  LogIn,
  Sparkles,
  TrendingUp,
  Server,
  Activity
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isVoiceTesting, setIsVoiceTesting] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Glowing Microphone Wave Visualizer Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const height = canvas.height;
      const width = canvas.width;
      const centerY = height / 2;

      // Cyan Neon Sine Wave
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#06b6d4';

      ctx.moveTo(0, centerY);
      for (let i = 0; i < width; i++) {
        const waveFrequency = 0.04;
        const amplitude = isVoiceTesting ? 24 : 12;
        const wave1 = Math.sin(i * waveFrequency + step * 0.12) * amplitude;
        const wave2 = Math.cos(i * 0.02 + step * 0.08) * (amplitude / 2);
        ctx.lineTo(i, centerY + wave1 + wave2);
      }
      ctx.stroke();

      // Purple Glow Secondary Wave
      ctx.beginPath();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#a855f7';

      ctx.moveTo(0, centerY);
      for (let i = 0; i < width; i++) {
        const wave = Math.sin(i * 0.03 - step * 0.09) * (isVoiceTesting ? 18 : 8);
        ctx.lineTo(i, centerY + wave);
      }
      ctx.stroke();

      step++;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isVoiceTesting]);

  // Handle Live Voice Test Trigger
  const handleTestMic = () => {
    setIsVoiceTesting(true);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('JYNEX AGENT voice neural engine is fully operational.');
      utterance.pitch = 1.0;
      utterance.rate = 1.05;
      utterance.onend = () => setIsVoiceTesting(false);
      utterance.onerror = () => setIsVoiceTesting(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsVoiceTesting(false), 2500);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#040711] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white flex flex-col justify-between overflow-x-hidden relative">
      
      {/* Background Gradients */}
      <div className="absolute -top-40 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 left-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* 1. TOP NAVBAR */}
      <header className="h-20 border-b border-slate-800/80 bg-[#060a17]/80 backdrop-blur-xl px-8 lg:px-14 flex items-center justify-between shrink-0 z-30 sticky top-0">
        
        {/* Permanent JYNEX AGENT Logo */}
        <Link href="/" className="flex items-center gap-3 group transition-transform active:scale-95">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#070b1a] rounded-[14px] flex items-center justify-center text-cyan-400 group-hover:text-cyan-300">
              <Activity size={20} className="animate-pulse" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-wider text-white uppercase">
            JYNEX <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">AGENT</span>
          </span>
        </Link>

        {/* Navigation Links with Corrected AI Agents Route */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/dashboard" className="hover:text-cyan-400 transition">
            Dashboard
          </Link>
          <Link href="/agents" className="hover:text-cyan-400 transition">
            AI Agents
          </Link>
          <Link href="/interview" className="hover:text-cyan-400 transition flex items-center gap-1.5">
            Interview Engine <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full font-mono">Live</span>
          </Link>
          <Link href="/results" className="hover:text-cyan-400 transition">
            Analytics
          </Link>
          <Link href="/setup" className="hover:text-cyan-400 transition">
            Pricing
          </Link>
        </nav>

        {/* Action Keys */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition shadow-md"
            title="Toggle Visual Theme"
          >
            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <Link
            href="/login"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            <LogIn size={15} /> Login
          </Link>

          <button
            onClick={() => router.push('/interview')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-xs tracking-wide transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* 2. HERO CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 py-10 flex flex-col justify-center gap-12 z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wide">
              <Zap size={14} className="text-purple-400 animate-pulse" />
              <span>Powered by JYNEX AGENT Real-Time Voice AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Real-Time Voice AI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
                Adaptive Intelligence
              </span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
              Conduct deep technical interviews with sub-second voice latency, real-time speech transcription, dynamic LLM follow-ups, and instant scorecard reports.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => router.push('/interview')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm tracking-wide transition shadow-xl shadow-blue-600/25 flex items-center gap-2.5 active:scale-95 group"
              >
                <span>Start Live Interview</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleTestMic}
                className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm transition flex items-center gap-2.5 shadow-lg active:scale-95"
              >
                <Play size={15} className="text-cyan-400 fill-cyan-400" />
                <span>{isVoiceTesting ? 'Testing Voice Output...' : 'Explore Platform Voice'}</span>
              </button>
            </div>

          </div>

          {/* Right Microphone Graphic */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            
            <div className="w-full absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 z-0">
              <canvas ref={canvasRef} width={500} height={140} className="w-full h-36" />
            </div>

            <div className="relative z-10 flex items-center justify-center p-8">
              <div className="absolute w-64 h-64 rounded-full border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)] pointer-events-none" />
              <div className="absolute w-52 h-52 rounded-full border border-purple-500/30 shadow-[0_0_35px_rgba(168,85,247,0.2)] pointer-events-none" />

              <button
                onClick={handleTestMic}
                className={`relative w-36 h-36 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[2px] shadow-[0_0_60px_rgba(6,182,212,0.4)] transition-transform duration-300 hover:scale-105 active:scale-95 flex items-center justify-center ${
                  isVoiceTesting ? 'animate-pulse ring-4 ring-cyan-400/40' : ''
                }`}
                title="Click to trigger voice engine test"
              >
                <div className="w-full h-full rounded-full bg-[#070b1a] flex flex-col items-center justify-center overflow-hidden border border-cyan-300/30">
                  <Mic size={44} className="text-cyan-400 drop-shadow-[0_0_12px_#06b6d4]" />
                </div>
              </button>
            </div>

            <div className="z-10 mt-2 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 px-4 py-1.5 rounded-full flex items-center gap-2 text-xs shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-white font-medium">System Online</span>
              <span className="text-slate-500 font-mono">| All JYNEX AGENT Engines Operational</span>
            </div>

          </div>

        </div>

        {/* 3. FOUR FEATURE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div 
            onClick={() => router.push('/interview')}
            className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 hover:border-cyan-500/40 transition duration-300 shadow-lg group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Ultra Fast</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sub-second voice latency for completely natural human-grade conversations.
            </p>
          </div>

          <div 
            onClick={() => router.push('/agents')}
            className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 hover:border-purple-500/40 transition duration-300 shadow-lg group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bot size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center justify-between">
              <span>AI Adaptive</span>
              <ArrowRight size={14} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Meet Alex, Sarah & Emma. Dynamic follow-ups customized to your tech stack.
            </p>
          </div>

          <div 
            onClick={() => router.push('/results')}
            className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 hover:border-emerald-500/40 transition duration-300 shadow-lg group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Smart Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time insights, filler word detection, and comprehensive scorecards.
            </p>
          </div>

          <div 
            onClick={() => router.push('/interview')}
            className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-5 hover:border-amber-500/40 transition duration-300 shadow-lg group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield size={20} />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Secure & Private</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise-grade encryption protecting candidate session video & speech data.
            </p>
          </div>
        </div>

        {/* 4. BOTTOM METRICS BAR */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-6 items-center shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white block leading-tight">20K+</span>
              <span className="text-xs text-slate-400">Interviews Conducted</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white block leading-tight">95%</span>
              <span className="text-xs text-slate-400">Accuracy Rate</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white block leading-tight">&lt;1s</span>
              <span className="text-xs text-slate-400">Voice Response Time</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Server size={20} />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white block leading-tight">99.9%</span>
              <span className="text-xs text-slate-400">System Uptime</span>
            </div>
          </div>
        </div>

      </main>

      {/* 5. FOOTER */}
      <footer className="h-14 border-t border-slate-800/80 bg-[#060914] px-8 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300 uppercase">JYNEX AGENT</span>
          <span>© 2026. Next-Generation Autonomous Technical Interviewer.</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Link href="/agents" className="hover:text-cyan-400 transition">AI Agents</Link>
          <Link href="/interview" className="hover:text-cyan-400 transition">Interview Room</Link>
          <Link href="/results" className="hover:text-cyan-400 transition">Scorecard</Link>
          <Link href="/profile" className="hover:text-cyan-400 transition">Profile</Link>
        </div>
      </footer>

    </div>
  );
}
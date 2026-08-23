'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, ArrowRight, Bot, Mic, ShieldCheck, 
  Cpu, Activity, ChevronRight, Play, X, Compass, BarChart2 
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [showExploreModal, setShowExploreModal] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic 3D interactive floating particles animation (Stellagent style)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particle nodes & connecting laser lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${p.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${0.15 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#05070D] text-slate-100 font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden flex flex-col justify-between">
      
      {/* Live Animated Canvas (3D Node Grid) */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Ambient Radial Lighting */}
      <div className="absolute top-[-15%] left-[25%] w-[650px] h-[650px] bg-blue-600/20 rounded-full blur-[160px] pointer-events-none z-0 animate-pulse" />
      <div className="absolute top-[40%] right-[-10%] w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[170px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[170px] pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 p-[1px] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="h-full w-full bg-[#080C16] rounded-2xl flex items-center justify-center">
              <Bot className="text-blue-400" size={22} />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
            STELLA<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">GENT</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-widest text-slate-400">
          <button onClick={() => router.push('/dashboard')} className="hover:text-white transition flex items-center gap-1.5">
            <BarChart2 size={14} className="text-blue-400" /> Dashboard
          </button>
          <button onClick={() => setShowExploreModal(true)} className="hover:text-white transition">
            Architecture
          </button>
          <button onClick={() => router.push('/setup')} className="hover:text-white transition">
            Interview Engine
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/setup')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs uppercase tracking-wider font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 border border-blue-400/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Launch Studio <ChevronRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-16 text-center relative z-10 flex flex-col items-center">
        
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-xl mb-8 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
          <Sparkles size={14} className="text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-[11px] font-semibold tracking-widest uppercase text-blue-300">
            Autonomous Voice AI Interviewer
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.08] mb-6">
          Real-Time Voice AI <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400">
            Adaptive Intelligence
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl font-normal leading-relaxed mb-10">
          Conduct deep technical interviews with sub-second voice latency, real-time speech transcription, dynamic LLM follow-ups, and instant scorecard reports.
        </p>

        {/* Action Button Strip */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => router.push('/setup')}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-black hover:bg-slate-200 font-semibold px-8 py-4 rounded-2xl text-sm transition-all hover:shadow-[0_0_35px_rgba(255,255,255,0.35)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            Start Live Simulation <ArrowRight size={16} />
          </button>

          {/* Original Explore Button with Modal Trigger */}
          <button
            onClick={() => setShowExploreModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 px-7 py-4 rounded-2xl text-sm font-semibold backdrop-blur-xl transition hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          >
            <Compass size={16} className="text-blue-400" /> Explore
          </button>
        </div>

        {/* 3D Glass Interactive Info Cards */}
        <div className="w-full mt-14 p-3 sm:p-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-2xl shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            
            <div className="bg-[#080D18]/90 border border-slate-800/80 rounded-2xl p-5 hover:border-blue-500/40 transition group">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition">
                <Mic size={18} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Sub-Second TTS Stream</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                FastAPI audio streaming directly through browser nodes with audio visualizer frequency response.
              </p>
            </div>

            <div className="bg-[#080D18]/90 border border-slate-800/80 rounded-2xl p-5 hover:border-indigo-500/40 transition group">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition">
                <Cpu size={18} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">LLaMA 3.3 Context Loop</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates exact candidate keywords to generate continuous non-repeating follow-up questions.
              </p>
            </div>

            <div className="bg-[#080D18]/90 border border-slate-800/80 rounded-2xl p-5 hover:border-emerald-500/40 transition group">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition">
                <Activity size={18} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Scorecard Analytics & PDF</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Structured rubric scoring across Accuracy, Depth, and Communication with single-click PDF export.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Explore Interactive Modal */}
      {showExploreModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A0E1A] border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button 
              onClick={() => setShowExploreModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} /> System Architecture Overview
            </div>
            <h2 className="text-xl font-bold text-white mb-4">How Stellagent Autonomous Pipeline Works</h2>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="font-semibold text-blue-400">1. Real-Time Speech Ingestion:</span> Web Speech API and Groq Whisper ingest candidate audio and convert it to clean tokens.
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="font-semibold text-indigo-400">2. Adaptive Reasoning Engine:</span> Groq LLaMA 3.3-70B analyzes the conversation transcript and extracts key concepts for next-stage questioning.
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="font-semibold text-emerald-400">3. Low-Latency Voice Generation:</span> gTTS pipeline returns binary audio stream rendered with live reactive visualizer waveforms.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowExploreModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowExploreModal(false);
                  router.push('/setup');
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-lg transition"
              >
                Start Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900/80 py-6 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 Stellagent Voice AI Engine. All rights reserved.</p>
      </footer>
    </div>
  );
}
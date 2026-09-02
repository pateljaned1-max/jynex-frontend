'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Sparkles,
  Code2,
  Briefcase,
  UserCheck,
  Zap,
  ArrowRight,
  Sliders,
  Play,
  Volume2,
  CheckCircle2,
  Cpu,
  ShieldAlert,
  Settings2,
  MessageSquare
} from 'lucide-react';

export default function AIAgentsDirectoryPage() {
  const router = useRouter();

  // Selected agent for live configuration preview
  const [selectedAgentId, setSelectedAgentId] = useState<'alex' | 'sarah' | 'emma'>('alex');
  const [difficulty, setDifficulty] = useState<'Standard' | 'Senior' | 'Staff'>('Senior');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [isAuditioning, setIsAuditioning] = useState<boolean>(false);

  const agents = [
    {
      id: 'alex',
      name: 'Alex',
      role: 'Technical Lead AI',
      badge: 'Core Architecture & Coding',
      color: 'from-cyan-500 to-blue-600',
      borderGlow: 'border-cyan-500/40 shadow-cyan-500/15',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      description: 'Specializes in algorithmic efficiency, real-time code evaluation, database indexing, and backend scalability.',
      specialties: ['React & Next.js', 'Python / Node.js', 'Distributed Systems', 'Data Structures', 'REST & GraphQL'],
      sampleAudio: 'Hello! I am Alex. I will evaluate your architecture depth, code performance, and runtime complexity.'
    },
    {
      id: 'sarah',
      name: 'Sarah',
      role: 'Hiring Manager AI',
      badge: 'Leadership & System Design',
      color: 'from-amber-400 to-orange-600',
      borderGlow: 'border-amber-500/40 shadow-amber-500/15',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
      description: 'Focuses on strategic decision making, business-impact analysis, team ownership, and architectural trade-offs.',
      specialties: ['System Design', 'Project Ownership', 'Trade-off Analysis', 'Engineering Roadmaps', 'Cross-Team Comms'],
      sampleAudio: 'Hi, I am Sarah. I look at how your technical choices drive production uptime and business milestones.'
    },
    {
      id: 'emma',
      name: 'Emma',
      role: 'Behavioral & Culture AI',
      badge: 'Soft Skills & Leadership',
      color: 'from-purple-400 to-pink-600',
      borderGlow: 'border-purple-500/40 shadow-purple-500/15',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
      description: 'Evaluates emotional intelligence, conflict resolution, verbal clarity, pace, confidence, and filler word frequency.',
      specialties: ['Conflict Management', 'Confidence Scoring', 'Culture Fit', 'STAR Methodology', 'Active Listening'],
      sampleAudio: 'Welcome! I am Emma. I will guide our behavioral scenarios to observe how you tackle collaboration challenges.'
    }
  ];

  const activeAgentData = agents.find((a) => a.id === selectedAgentId)!;

  // Real browser voice preview
  const handleTestVoice = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    setIsAuditioning(true);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSpeed;
    utterance.pitch = selectedAgentId === 'alex' ? 1.05 : selectedAgentId === 'sarah' ? 0.95 : 1.15;
    utterance.onend = () => setIsAuditioning(false);
    utterance.onerror = () => setIsAuditioning(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen w-full bg-[#040711] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. TOP NAVBAR */}
      <header className="h-16 border-b border-slate-800/80 bg-[#060a17]/90 px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[1.5px]">
            <div className="w-full h-full bg-[#070b1a] rounded-[10px] flex items-center justify-center text-cyan-400">
              <Bot size={18} />
            </div>
          </div>
          <span className="font-extrabold text-lg tracking-wider text-white uppercase">
            JYNEX <span className="text-cyan-400">AGENT</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <Link href="/dashboard" className="hover:text-cyan-400 transition">Dashboard</Link>
          <Link href="/agents" className="text-cyan-400 border-b-2 border-cyan-400 pb-0.5">AI Agents</Link>
          <Link href="/interview" className="hover:text-cyan-400 transition">Interview Engine</Link>
          <Link href="/results" className="hover:text-cyan-400 transition">Analytics</Link>
        </nav>

        <button
          onClick={() => router.push('/interview')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <span>Start Full Panel</span>
          <ArrowRight size={13} />
        </button>
      </header>

      {/* 2. MAIN HUB CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 py-8 flex flex-col gap-8">
        
        {/* Title & Introduction */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
              <Sparkles size={13} /> Autonomous Interview Intelligence
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              JYNEX AI Agent Neural Matrix
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Meet the three specialized autonomous agents powering your live assessment. You can audition their voices, configure difficulty thresholds, or launch targeted 1-on-1 interviews.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-1.5 rounded-xl text-xs">
            <span className="text-slate-400 px-2 font-medium">Global Multi-Agent Mode:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>
        </div>

        {/* 3 AGENTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {agents.map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id as any)}
                className={`rounded-2xl p-5 border cursor-pointer transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? `bg-slate-900/90 ${agent.borderGlow} shadow-2xl scale-[1.02]`
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${agent.color}`} />

                <div>
                  {/* Top Avatar & Role */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${agent.color} p-[2px] shadow-lg shrink-0`}>
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-white text-lg">{agent.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                          v2.4
                        </span>
                      </div>
                      <p className="text-xs text-cyan-400 font-semibold">{agent.role}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block font-mono">{agent.badge}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {agent.description}
                  </p>

                  {/* Specialties Pills */}
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Focus Coverage</span>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestVoice(agent.sampleAudio);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
                  >
                    <Volume2 size={13} className="text-cyan-400" />
                    <span>Audition Voice</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/interview');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-bold transition"
                  >
                    <span>Mock with {agent.name}</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* AGENT TUNING & LIVE ORCHESTRATION PANEL */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sliders size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Agent Runtime Orchestration</h3>
                <p className="text-xs text-slate-400">Configure parameters for {activeAgentData.name} before starting the session</p>
              </div>
            </div>

            <span className="text-xs text-slate-500 font-mono">Agent ID: AGT-{activeAgentData.id.toUpperCase()}-09</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Control 1: Difficulty Threshold */}
            <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800/60">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Cpu size={14} className="text-cyan-400" /> Evaluation Rigor
              </label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['Standard', 'Senior', 'Staff'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDifficulty(lvl)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                      difficulty === lvl
                        ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-600/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-500 block pt-1">
                {difficulty === 'Staff' ? 'Expects complex failure-mode discussions' : 'Focuses on idiomatic patterns and fundamentals'}
              </span>
            </div>

            {/* Control 2: Voice Latency / Speed */}
            <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-slate-800/60">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Volume2 size={14} className="text-purple-400" /> Speech Rate
                </label>
                <span className="text-xs font-mono text-cyan-400 font-bold">{voiceSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                <span>0.8x (Deliberate)</span>
                <span>1.0x (Natural)</span>
                <span>1.3x (Fast-Paced)</span>
              </div>
            </div>

            {/* Control 3: Launch Session Action */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/60 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Ready to practice?
                </span>
                <p className="text-xs text-slate-400 leading-snug">
                  {activeAgentData.name} will tailor questions to the {difficulty} tier.
                </p>
              </div>

              <button
                onClick={() => router.push('/interview')}
                className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs tracking-wide transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95"
              >
                <Play size={13} className="fill-white" />
                <span>Launch Interview Room with {activeAgentData.name}</span>
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* 3. FOOTER */}
      <footer className="h-14 border-t border-slate-800/80 bg-[#060914] px-8 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300 uppercase">JYNEX AGENT</span>
          <span>© 2026. Multi-Agent Autonomous Assessment Pipeline.</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Link href="/dashboard" className="hover:text-cyan-400 transition">Dashboard</Link>
          <Link href="/interview" className="hover:text-cyan-400 transition">Interview Room</Link>
          <Link href="/results" className="hover:text-cyan-400 transition">Scorecard</Link>
        </div>
      </footer>

    </div>
  );
}
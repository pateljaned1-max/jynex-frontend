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
  Volume2,
  VolumeX,
  PhoneOff,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  Bot,
  LineChart,
  FileText,
  Settings,
  ShieldAlert,
  Code2,
  UserCheck,
  Briefcase,
  Zap,
  Activity,
  Smile,
  MonitorUp,
  User
} from 'lucide-react';

export default function FullLiveInterviewRoom() {
  const router = useRouter();

  // Call controls state
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [candidateName, setCandidateName] = useState('Candidate');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // AI Speaking State & Voice
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Video & Canvas Refs
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic Questions & Real-Time Sync State
  const [questionIndex, setQuestionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(12 * 60 + 45);

  const questionsList = [
    {
      q: 'What programming languages are you most comfortable with, and how does the React Virtual DOM optimize performance?',
      userAnswer: 'I mainly work with JavaScript and Python. The Virtual DOM creates an in-memory representation and calculates minimal diffs before repainting.',
      correction: 'Great explanation of reconciliation! You could also mention Fiber architecture and batch updating for bonus points.',
      accuracy: 94,
      grammar: 'Clean & Concise',
      keyConcept: 'Virtual DOM Diffing & Reconciliation',
      commScore: 88,
      techScore: 92,
      confScore: 90,
      probScore: 85,
      wpm: 138,
      filler: 2,
      emotion: 'Calm & Confident',
      decision: 'Alex approved technical accuracy. Difficulty maintained at Medium-Hard level.',
      alexNote: 'Candidate performed well in React diffing algorithm.',
      emmaNote: 'Confidence and tone are well-balanced.',
      sarahNote: 'Ready for higher system design queries.'
    },
    {
      q: 'Can you explain how indexing works in MongoDB and when you should use a compound index?',
      userAnswer: 'MongoDB uses B-trees for indexes. Single field indexes work on one field, while compound indexes index multiple fields to optimize complex queries.',
      correction: 'Strong answer! Be sure to emphasize index prefix rules and index order (ESR rule: Equality, Sort, Range).',
      accuracy: 89,
      grammar: 'Precise and Structured',
      keyConcept: 'ESR Rule & Compound B-Tree Indexing',
      commScore: 82,
      techScore: 95,
      confScore: 87,
      probScore: 91,
      wpm: 145,
      filler: 4,
      emotion: 'Analytical & Focused',
      decision: 'Emma detected hesitation on B-Trees. Sarah generated next edge-case question.',
      alexNote: 'Strong index knowledge; missed ESR edge case.',
      emmaNote: 'Pace slightly fast during indexing explanation.',
      sarahNote: 'Pushed question difficulty to Hard.'
    },
    {
      q: 'How do you handle rate limiting in a microservices backend built with Node.js and Redis?',
      userAnswer: 'I implement a token bucket or sliding window algorithm using Redis to keep a centralized counter per IP or API key token.',
      correction: 'Spot on with Redis. Mention adding HTTP 429 Too Many Requests status and Retry-After headers for complete API contracts.',
      accuracy: 97,
      grammar: 'High Technical Depth',
      keyConcept: 'Redis Token Bucket & HTTP 429',
      commScore: 95,
      techScore: 98,
      confScore: 94,
      probScore: 96,
      wpm: 132,
      filler: 1,
      emotion: 'Highly Confident',
      decision: 'Unanimous AI approval: Candidate ready for System Architecture challenge.',
      alexNote: 'Flawless Redis sliding window explanation.',
      emmaNote: 'Clear delivery, zero nervous fillers detected.',
      sarahNote: 'Candidate recommended for Senior Engineering track.'
    }
  ];

  const currentData = questionsList[questionIndex];

  // Dynamic user name from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setCandidateName(parsed.name);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Web Speech API: AI speaks question aloud
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeakerMuted) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speak initial question on load & whenever question changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      speakText(currentData.q);
    }, 800);

    return () => {
      clearTimeout(timeout);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [questionIndex, isSpeakerMuted]);

  // Real Webcam initialization & graceful fallback
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false,
        });
        mediaStreamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
        setCameraError(null);
      } catch (err) {
        setCameraError('Camera off / not available');
      }
    }

    if (!isVideoOff) {
      startCamera();
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOff]);

  const toggleVideo = () => {
    setIsVideoOff((prev) => !prev);
  };

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Audio Canvas Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isMicMuted) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#06b6d4';
        const height = canvas.height;
        const width = canvas.width;

        ctx.moveTo(0, height / 2);
        for (let i = 0; i < width; i++) {
          const wave1 = Math.sin(i * 0.05 + step * 0.1) * 8;
          const wave2 = Math.cos(i * 0.02 + step * 0.06) * 4;
          ctx.lineTo(i, height / 2 + wave1 + wave2);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.moveTo(0, height / 2);
        for (let i = 0; i < width; i++) {
          const wave = Math.cos(i * 0.04 + step * 0.08) * 6;
          ctx.lineTo(i, height / 2 + wave);
        }
        ctx.stroke();

        step++;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isMicMuted]);

  const handleNextQuestion = () => {
    setQuestionIndex((prev) => (prev + 1) % questionsList.length);
  };

  return (
    <div className="h-screen w-screen bg-[#040711] text-slate-200 font-sans flex flex-col overflow-hidden select-none">
      
      {/* TOP HEADER */}
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

        {/* Center Timer */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-300 font-mono text-sm bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
            <Clock size={15} className="text-cyan-400" />
            <span className="font-bold text-white tracking-wider">{formatTimer(secondsLeft)}</span>
            <span className="text-xs text-slate-500">Remaining</span>
          </div>

          <div className="flex items-center gap-1 h-5 px-2">
            <div className={`w-1 bg-cyan-400 rounded-full ${isAiSpeaking ? 'h-5 animate-pulse' : 'h-2'}`} />
            <div className={`w-1 bg-purple-400 rounded-full ${isAiSpeaking ? 'h-4 animate-bounce' : 'h-3'}`} />
            <div className={`w-1 bg-blue-400 rounded-full ${isAiSpeaking ? 'h-5 animate-pulse' : 'h-1.5'}`} />
          </div>
        </div>

        <button
          onClick={() => router.push('/results')}
          className="bg-rose-600/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 px-4 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-rose-600/10"
        >
          <PhoneOff size={14} /> End Interview
        </button>
      </header>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT NAV SIDEBAR */}
        <aside className="w-52 border-r border-slate-800/80 bg-[#060914] p-4 flex flex-col justify-between shrink-0 hidden lg:flex">
          <nav className="space-y-1.5">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition text-xs font-medium">
              <LayoutDashboard size={15} /> Dashboard
            </Link>
            <Link href="/interview" className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold shadow-lg shadow-cyan-500/5">
              <Video size={15} className="text-cyan-400" /> Interview Room
            </Link>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition text-xs font-medium">
              <Bot size={15} /> AI Agents
            </a>
            <Link href="/results" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition text-xs font-medium">
              <LineChart size={15} /> Analysis
            </Link>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition text-xs font-medium">
              <FileText size={15} /> Reports
            </a>
            <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition text-xs font-medium">
              <Settings size={15} /> Settings
            </Link>
          </nav>

          <div className="space-y-2">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Interview ID</span>
              <span className="text-xs font-mono font-medium text-slate-300">INT-2026-09-03</span>
            </div>
            <button className="flex items-center justify-center gap-2 w-full py-1.5 text-slate-500 hover:text-slate-300 text-xs transition">
              <ShieldAlert size={13} /> Report Issue
            </button>
          </div>
        </aside>

        {/* CENTER COLUMN: DUAL CALL TILES + CORRECTION + DECISION PIPELINE */}
        <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-gradient-to-b from-[#060a16] via-[#050812] to-[#03050c]">
          
          {/* VIDEO CALL STREAM TILES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64 shrink-0">
            
            {/* AI Talking Interviewer Avatar Tile */}
            <div className={`bg-slate-950 border rounded-2xl relative overflow-hidden shadow-xl flex flex-col justify-between p-3.5 transition-all ${
              isAiSpeaking ? 'border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.2)]' : 'border-slate-800'
            }`}>
              <div className="w-full flex items-center justify-between text-xs z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium text-[10px]">
                  <Sparkles size={11} /> AI Interviewer
                </span>
                <span className={`text-[10px] font-mono flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                  isAiSpeaking 
                    ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' 
                    : 'text-slate-400 bg-slate-900/80 border-slate-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isAiSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  {isAiSpeaking ? 'Speaking Question...' : 'Listening'}
                </span>
              </div>

              {/* Glowing Interactive Speaking Orb Avatar */}
              <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
                <div className={`absolute rounded-full transition-all duration-700 ${
                  isAiSpeaking 
                    ? 'w-48 h-48 bg-cyan-500/30 blur-3xl animate-pulse' 
                    : 'w-32 h-32 bg-blue-600/10 blur-2xl'
                }`} />
                <div className={`relative rounded-full p-1 transition-transform duration-300 ${
                  isAiSpeaking ? 'scale-110 shadow-[0_0_40px_#06b6d4]' : 'scale-95'
                } bg-gradient-to-tr from-cyan-400 via-blue-600 to-purple-600`}>
                  <div className="w-24 h-24 rounded-full bg-[#070b1a] flex items-center justify-center border border-cyan-300/40 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80"
                      alt="Sarah AI"
                      className={`w-full h-full object-cover rounded-full ${isAiSpeaking ? 'brightness-110' : 'brightness-75'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full flex items-center justify-between text-xs z-10 bg-slate-950/70 backdrop-blur-md p-2 rounded-xl border border-slate-800/60">
                <span className="text-slate-200 font-semibold flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isAiSpeaking ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-slate-500'}`} />
                  Sarah (Technical AI Lead)
                </span>
                <div className="flex items-center gap-1 h-3">
                  <span className={`w-0.5 bg-cyan-400 rounded-full ${isAiSpeaking ? 'h-full animate-bounce' : 'h-1'}`} />
                  <span className={`w-0.5 bg-cyan-400 rounded-full ${isAiSpeaking ? 'h-2 animate-bounce' : 'h-1'}`} />
                  <span className={`w-0.5 bg-cyan-400 rounded-full ${isAiSpeaking ? 'h-full animate-bounce' : 'h-1'}`} />
                </div>
              </div>
            </div>

            {/* Candidate Real Webcam Tile with Fallback Avatar */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden shadow-xl flex flex-col justify-between p-3.5">
              <div className="w-full flex justify-between items-center text-xs z-10">
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                  {isVideoOff ? 'Camera Off' : 'Live Camera'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  isVideoOff ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {isVideoOff ? 'Avatar Mode' : 'Webcam Live'}
                </span>
              </div>

              <div className="absolute inset-0 z-0">
                {/* Fallback Animated Avatar when Camera is Turned Off */}
                {isVideoOff ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-[#070e24] to-slate-950">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-2xl shadow-cyan-500/20 flex items-center justify-center animate-pulse">
                      <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">
                          {candidateName ? candidateName.charAt(0).toUpperCase() : 'C'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 mt-2 font-medium">{candidateName}</span>
                    <span className="text-[10px] text-slate-500">Camera stream is muted</span>
                  </div>
                ) : cameraError ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 text-amber-400/80 flex-col gap-1 p-3 text-center">
                    <VideoOff size={26} />
                    <span className="text-xs">{cameraError}</span>
                  </div>
                ) : (
                  <video
                    ref={userVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30 pointer-events-none" />
              </div>

              <div className="w-full flex items-center justify-between text-xs z-10 bg-slate-950/70 backdrop-blur-md p-2 rounded-xl border border-slate-800/60">
                <span className="text-white font-medium flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isMicMuted ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                  {candidateName}
                </span>
                <span className={`text-[10px] font-mono ${isMicMuted ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isMicMuted ? 'Mic Muted' : 'Microphone Active'}
                </span>
              </div>
            </div>

          </div>

          {/* CALL CONTROLS DOCK */}
          <div className="h-12 bg-slate-950/90 border border-slate-800/80 rounded-xl px-4 flex items-center justify-center gap-3 shrink-0 shadow-lg">
            <button
              onClick={() => setIsMicMuted(!isMicMuted)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition border ${
                isMicMuted
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {isMicMuted ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            <button
              onClick={toggleVideo}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition border ${
                isVideoOff
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {isVideoOff ? <VideoOff size={15} /> : <Video size={15} />}
            </button>

            <button
              onClick={() => {
                setIsSpeakerMuted(!isSpeakerMuted);
                if (!isSpeakerMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setIsAiSpeaking(false);
                }
              }}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition border ${
                isSpeakerMuted
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {isSpeakerMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition border ${
                isScreenSharing
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <MonitorUp size={15} />
            </button>

            <button
              onClick={() => router.push('/results')}
              className="px-4 h-9 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-lg shadow-rose-600/20 ml-2"
            >
              <PhoneOff size={14} /> End Call
            </button>
          </div>

          {/* REAL-TIME DYNAMIC QUESTION CORRECTION & CONCEPT TRACKER */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Live Answer Correction & Concept Tracker
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                Model: Jynex Evaluator v2.4
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <MessageSquare size={12} className="text-blue-400" /> Captured Candidate Speech
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed italic">
                  "{currentData.userAnswer}"
                </p>
              </div>

              <div className="bg-slate-900/50 border border-amber-500/20 p-3 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <AlertTriangle size={12} /> AI Live Correction / Recommendation
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {currentData.correction}
                </p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                    <TrendingUp size={12} className="text-emerald-400" /> Accuracy & Fluency
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-black text-emerald-400">{currentData.accuracy}%</span>
                    <span className="text-[10px] text-slate-400">{currentData.grammar}</span>
                  </div>
                </div>
                <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                  Concept: <span className="text-white font-medium">{currentData.keyConcept}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AGENT COLLABORATION DECISION WORKFLOW (DYNAMIC DATA) */}
          <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Zap size={14} className="text-purple-400" />
                <span>Agent Collaboration System</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                Shared Neural Context
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-cyan-500/30 p-3 rounded-xl flex items-start gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Code2 size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Technical AI (Alex)</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{currentData.alexNote}</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-purple-500/30 p-3 rounded-xl flex items-start gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <UserCheck size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Behavioural AI (Emma)</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{currentData.emmaNote}</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-amber-500/30 p-3 rounded-xl flex items-start gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Briefcase size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Hiring Manager AI (Sarah)</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{currentData.sarahNote}</p>
                </div>
              </div>
            </div>

            {/* Dynamic AI Decision Box */}
            <div className="bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-blue-950/40 border border-cyan-500/30 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wide">
                <Zap size={14} className="animate-pulse text-cyan-400" />
                <span>AI Collaboration Decision</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-medium">{currentData.decision}</p>
            </div>

            {/* Next Question CTA Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-3.5 flex items-center justify-between text-white shadow-xl shadow-indigo-600/20">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200 block">NEXT QUESTION GENERATED</span>
                <span className="text-xs font-semibold text-white">
                  Question {questionIndex + 1} of {questionsList.length} • Difficulty: Medium → <strong className="text-amber-300">Hard</strong>
                </span>
              </div>
              <button
                onClick={handleNextQuestion}
                className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition active:scale-95 shadow-md"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </main>

        {/* RIGHT SIDEBAR: DYNAMIC ANALYSIS & LIVE TRANSCRIPTIONS */}
        <aside className="w-80 border-l border-slate-800/80 bg-[#060914] p-4 flex flex-col justify-between shrink-0 overflow-y-auto hidden xl:flex space-y-4">
          
          {/* LIVE ANALYSIS DYNAMIC METRICS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" /> Live Analysis
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-cyan-400" /> Communication
                </span>
                <span className="font-bold text-white">{currentData.commScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${currentData.commScore}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Code2 size={13} className="text-blue-400" /> Technical Skills
                </span>
                <span className="font-bold text-white">{currentData.techScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                  style={{ width: `${currentData.techScore}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-purple-400" /> Confidence
                </span>
                <span className="font-bold text-white">{currentData.confScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" 
                  style={{ width: `${currentData.confScore}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-400" /> Problem Solving
                </span>
                <span className="font-bold text-white">{currentData.probScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500" 
                  style={{ width: `${currentData.probScore}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Filler Words</span>
                <span className="text-sm font-bold text-white">~ {currentData.filler}</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Speaking Pace</span>
                <span className="text-sm font-bold text-white">~ {currentData.wpm} WPM</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Emotion Status</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Smile size={14} /> {currentData.emotion}
              </span>
            </div>
          </div>

          {/* DYNAMIC TRANSCRIPTIONS STREAM */}
          <div className="space-y-2 pt-2 border-t border-slate-800 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" /> Transcriptions
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Live Sync</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-52 pr-1 text-xs">
              <div className="bg-gradient-to-r from-blue-950/40 to-slate-900/80 border border-blue-500/30 p-2.5 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-blue-400 block">AI Interviewer (Speaking)</span>
                <p className="text-white font-medium leading-snug">
                  "{currentData.q}"
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/60 p-2.5 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">{candidateName} (Captured Answer)</span>
                <p className="text-slate-300 leading-snug italic">
                  "{currentData.userAnswer}"
                </p>
              </div>
            </div>
          </div>

          {/* VOICE ACTIVITY SINE WAVE */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
              <span className="flex items-center gap-1.5"><Mic size={14} className="text-cyan-400" /> Voice Activity</span>
              <span className={`text-[10px] ${isMicMuted ? 'text-rose-400' : 'text-cyan-400'}`}>
                {isMicMuted ? 'Muted' : 'Listening...'}
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl flex flex-col items-center justify-center">
              <canvas ref={canvasRef} width={260} height={36} className="w-full h-9" />
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
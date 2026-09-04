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
  AlertTriangle,
  User
} from 'lucide-react';

export default function FullLiveInterviewRoom() {
  const router = useRouter();

  // Call Controls State
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [candidateName, setCandidateName] = useState('Candidate');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Active AI Agent State
  const [selectedAgentId, setSelectedAgentId] = useState<'sarah' | 'alex' | 'emma'>('sarah');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Video Refs
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const idleVideoRef = useRef<HTMLVideoElement | null>(null);
  const talkingVideoRef = useRef<HTMLVideoElement | null>(null);

  // Multi-Agent Profiles with Reliable Cloud Videos & Image Fallbacks
  const agentsProfile = {
    sarah: {
      name: 'Sarah',
      role: 'Hiring Lead AI',
      gender: 'female' as const,
      poster: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=85',
      idleVideo: 'https://cdn.pixabay.com/video/2021/08/13/84918-587848480_tiny.mp4',
      talkingVideo: 'https://cdn.pixabay.com/video/2022/10/18/135502-762299868_tiny.mp4',
      badgeColor: 'text-amber-300 border-amber-500/30 bg-amber-500/10'
    },
    alex: {
      name: 'Alex',
      role: 'Technical Lead AI',
      gender: 'male' as const,
      poster: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
      idleVideo: 'https://cdn.pixabay.com/video/2020/05/25/40149-425026210_tiny.mp4',
      talkingVideo: 'https://cdn.pixabay.com/video/2021/04/12/70868-537482810_tiny.mp4',
      badgeColor: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10'
    },
    emma: {
      name: 'Emma',
      role: 'Behavioral AI',
      gender: 'female' as const,
      poster: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=85',
      idleVideo: 'https://cdn.pixabay.com/video/2021/08/04/83878-584347714_tiny.mp4',
      talkingVideo: 'https://cdn.pixabay.com/video/2022/11/04/137691-767789422_tiny.mp4',
      badgeColor: 'text-purple-300 border-purple-500/30 bg-purple-500/10'
    }
  };

  const currentAgent = agentsProfile[selectedAgentId];

  // Dynamic Question State
  const [questionIndex, setQuestionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(12 * 60 + 45);

  const questionsList = [
    {
      q: 'What programming languages are you most comfortable with, and how does the React Virtual DOM optimize performance?',
      keywords: ['react', 'virtual dom', 'javascript', 'performance', 'diff', 'state', 'render', 'reconciliation'],
      defaultAnswer: 'I mainly work with JavaScript and Python. The Virtual DOM creates an in-memory representation and calculates minimal diffs before repainting.',
      keyConcept: 'Virtual DOM Diffing & Reconciliation',
      alexNote: 'Strong knowledge of React reconciliation algorithms.',
      emmaNote: 'Confident delivery, concise tone and pacing.',
      sarahNote: 'Ready for production-scale architecture questions.'
    },
    {
      q: 'Can you explain how indexing works in MongoDB and when you should use a compound index?',
      keywords: ['mongodb', 'index', 'b-tree', 'compound', 'query', 'execution', 'performance', 'scan'],
      defaultAnswer: 'MongoDB uses B-trees for indexes. Single field indexes work on one field, while compound indexes index multiple fields to optimize complex queries.',
      keyConcept: 'ESR Rule & Compound B-Tree Indexing',
      alexNote: 'Good understanding of index scan limitations.',
      emmaNote: 'Pacing was natural with structured reasoning.',
      sarahNote: 'Advancing difficulty level to Senior evaluation tier.'
    },
    {
      q: 'How do you handle rate limiting in a microservices backend built with Node.js and Redis?',
      keywords: ['redis', 'token bucket', 'rate limit', 'sliding window', 'headers', '429', 'throttle'],
      defaultAnswer: 'I implement a token bucket or sliding window algorithm using Redis to keep a centralized counter per IP or API key.',
      keyConcept: 'Redis Token Bucket & HTTP 429',
      alexNote: 'Flawless Redis sliding window architecture.',
      emmaNote: 'Zero hesitations, authoritative tone.',
      sarahNote: 'Candidate clears technical bar with high marks.'
    }
  ];

  const currentQ = questionsList[questionIndex];

  // Live Metrics
  const [liveAnswer, setLiveAnswer] = useState(currentQ.defaultAnswer);
  const [liveAccuracy, setLiveAccuracy] = useState(92);
  const [liveCorrection, setLiveCorrection] = useState('Solid fundamentals. Add explicit real-world system tradeoffs for extra credit.');
  const [liveGrammar, setLiveGrammar] = useState('Clear & Technical');
  const [liveScores, setLiveScores] = useState({ comm: 88, tech: 92, conf: 90, prob: 86 });
  const [liveFiller, setLiveFiller] = useState(1);
  const [liveWpm, setLiveWpm] = useState(136);
  const [liveEmotion, setLiveEmotion] = useState('Calm & Focused');
  const [liveDecision, setLiveDecision] = useState('Active evaluation in progress. AI agents analyzing response.');

  // Load Candidate Name
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

  // Sync Dual Video Streams with isAiSpeaking Flag
  useEffect(() => {
    if (isAiSpeaking) {
      if (talkingVideoRef.current) {
        talkingVideoRef.current.currentTime = 0;
        talkingVideoRef.current.play().catch(() => {});
      }
    } else {
      if (idleVideoRef.current) {
        idleVideoRef.current.play().catch(() => {});
      }
    }
  }, [isAiSpeaking, selectedAgentId]);

  // Gender-Specific Dynamic Voice Engine
  const speakText = (text: string, gender: 'male' | 'female' = 'female') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeakerMuted) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    if (gender === 'male') {
      const maleVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('george') ||
            v.name.toLowerCase().includes('guy') ||
            v.name.toLowerCase().includes('james') ||
            v.name.toLowerCase().includes('male'))
      );
      if (maleVoice) utterance.voice = maleVoice;
      utterance.pitch = 0.8;
      utterance.rate = 1.0;
    } else {
      const femaleVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('karen') ||
            v.name.toLowerCase().includes('victoria') ||
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('natural'))
      );
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = selectedAgentId === 'emma' ? 1.18 : 1.05;
      utterance.rate = 0.96;
    }

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Trigger speech on question change or agent switch
  useEffect(() => {
    const timer = setTimeout(() => {
      speakText(currentQ.q, currentAgent.gender);
    }, 450);

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [questionIndex, selectedAgentId, isSpeakerMuted]);

  // Speech-To-Text Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        interimTranscript += event.results[i][0].transcript;
      }

      if (interimTranscript.trim().length > 0) {
        const spokenText = interimTranscript;
        setLiveAnswer(spokenText);

        const lower = spokenText.toLowerCase();
        const matched = currentQ.keywords.filter((kw) => lower.includes(kw));
        const matchRatio = Math.min(100, Math.max(65, Math.round(65 + (matched.length / currentQ.keywords.length) * 35)));
        setLiveAccuracy(matchRatio);

        const words = spokenText.split(/\s+/).length;
        setLiveWpm(Math.min(165, Math.max(110, Math.round(words * 3.2))));
        
        const fillerMatches = spokenText.match(/\b(um|uh|like|you know|actually|basically)\b/gi) || [];
        setLiveFiller(fillerMatches.length);

        setLiveScores({
          comm: Math.min(98, 80 + Math.round(words * 0.4)),
          tech: matchRatio,
          conf: Math.max(75, 96 - fillerMatches.length * 4),
          prob: Math.min(96, 82 + matched.length * 3)
        });

        if (matched.length >= 3) {
          setLiveCorrection(`Strong coverage of core concepts (${matched.join(', ')}). Add edge-case considerations to hit 100%.`);
          setLiveGrammar('Sharp & Structured');
          setLiveDecision(`All 3 AI agents approve technical accuracy. Ready to advance.`);
        } else {
          setLiveCorrection(`Try mentioning relevant terms like: ${currentQ.keywords.slice(0, 3).join(', ')}.`);
          setLiveGrammar('Developing Argument');
          setLiveDecision(`Evaluating answer depth... ${currentAgent.name} assessing follow-up clarity.`);
        }
      }
    };

    if (!isMicMuted) {
      try {
        recognition.start();
      } catch (err) {}
    } else {
      recognition.stop();
    }

    return () => {
      try {
        recognition.stop();
      } catch (err) {}
    };
  }, [isMicMuted, questionIndex, selectedAgentId]);

  // Webcam Setup
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        mediaStreamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
        setCameraError(null);
      } catch (err) {
        setCameraError('Camera access denied');
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

  // Audio Canvas Waveform
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

  // Timer Countdown
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

  const handleNextQuestion = () => {
    const nextIdx = (questionIndex + 1) % questionsList.length;
    setQuestionIndex(nextIdx);
    const nextQData = questionsList[nextIdx];
    
    setLiveAnswer(nextQData.defaultAnswer);
    setLiveAccuracy(90 + Math.floor(Math.random() * 8));
    setLiveCorrection(`Listening for answer on ${nextQData.keyConcept}...`);
    setLiveScores({ comm: 88, tech: 90, conf: 92, prob: 88 });
    setLiveFiller(0);
    setLiveWpm(132);
    setLiveDecision(`Question updated. ${currentAgent.name} (${currentAgent.role}) is speaking prompt.`);
  };

  return (
    <div className="h-screen w-screen bg-[#040711] text-slate-200 font-sans flex flex-col overflow-hidden select-none">
      
      {/* 1. TOP HEADER */}
      <header className="h-14 border-b border-slate-800/80 bg-[#060a17]/95 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-cyan-500/20">
              <Sparkles size={16} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white uppercase">
              JYNEX <span className="text-cyan-400">AGENT</span>
            </span>
          </Link>

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

      {/* 2. MAIN VIEWPORT */}
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
            <Link href="/agents" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition text-xs font-medium">
              <Bot size={15} /> AI Agents
            </Link>
            <Link href="/results" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition text-xs font-medium">
              <LineChart size={15} /> Analysis
            </Link>
            <Link href="/reports" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition text-xs font-medium">
              <FileText size={15} /> Reports
            </Link>
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

        {/* CENTER MAIN STAGE */}
        <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-gradient-to-b from-[#060a16] via-[#050812] to-[#03050c]">
          
          {/* INTERACTIVE AGENT CHOICE SELECTOR BAR */}
          <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                <Bot size={14} className="text-cyan-400" /> Active Interviewer:
              </span>
              {(['sarah', 'alex', 'emma'] as const).map((agentKey) => {
                const isSelected = selectedAgentId === agentKey;
                const agentData = agentsProfile[agentKey];
                return (
                  <button
                    key={agentKey}
                    onClick={() => setSelectedAgentId(agentKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
                    <span>{agentData.name} ({agentData.gender === 'male' ? 'M' : 'F'})</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono pr-2">
              <span>Persona:</span>
              <span className="text-cyan-300 font-bold">{currentAgent.role}</span>
            </div>
          </div>

          {/* MAIN STAGE VIDEO CALL CONTAINER (IMAGE REPLICA LAYOUT) */}
          <div className="relative w-full h-[375px] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shrink-0 flex items-center justify-center">
            
            {/* Top Status Pill */}
            <div className="absolute top-4 left-5 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-xs font-bold text-white tracking-wide">{currentAgent.name} AI • LIVE</span>
            </div>

            {/* DYNAMIC REAL HUMAN VIDEO AVATAR ENGINE */}
            <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-black">
              
              {/* Fallback portrait to ensure avatar is NEVER blank */}
              <img
                src={currentAgent.poster}
                alt={currentAgent.name}
                className="w-full h-full object-cover object-top absolute inset-0 z-0 brightness-95"
              />

              {/* Idle Stream: Natural Head Movement & Eye Blinking */}
              <video
                ref={idleVideoRef}
                key={`idle-${selectedAgentId}`}
                src={currentAgent.idleVideo}
                autoPlay
                loop
                muted
                playsInline
                className={`w-full h-full object-cover object-top absolute inset-0 z-10 transition-opacity duration-300 ${
                  isAiSpeaking ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              />

              {/* Talking Stream: Natural Lip-Sync Motion */}
              <video
                ref={talkingVideoRef}
                key={`talking-${selectedAgentId}`}
                src={currentAgent.talkingVideo}
                loop
                muted
                playsInline
                className={`w-full h-full object-cover object-top absolute inset-0 z-10 transition-opacity duration-300 ${
                  isAiSpeaking ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              />

              <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/20 pointer-events-none" />
            </div>

            {/* PiP USER WEBCAM TILE (Top-Right Overlay) */}
            <div className="absolute top-4 right-5 z-20 w-32 h-44 sm:w-36 sm:h-48 rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl bg-slate-900 group">
              {isVideoOff ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-lg">
                    {candidateName.charAt(0)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-medium">Cam Muted</span>
                </div>
              ) : cameraError ? (
                <div className="w-full h-full flex items-center justify-center p-2 text-center text-rose-400 text-[10px] bg-slate-950">
                  {cameraError}
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

              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-white border border-slate-700">
                You
              </div>
            </div>

            {/* FLOATING IN-CALL CONTROLS */}
            <div className="absolute bottom-11 z-20 flex items-center gap-3">
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-xl border backdrop-blur-md active:scale-95 ${
                  isMicMuted
                    ? 'bg-rose-600/90 border-rose-500 text-white shadow-rose-600/30'
                    : 'bg-slate-900/85 border-slate-700/80 text-white hover:bg-slate-800'
                }`}
                title={isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-xl border backdrop-blur-md active:scale-95 ${
                  isVideoOff
                    ? 'bg-rose-600/90 border-rose-500 text-white shadow-rose-600/30'
                    : 'bg-slate-900/85 border-slate-700/80 text-white hover:bg-slate-800'
                }`}
                title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
              </button>

              <button
                onClick={() => {
                  setIsSpeakerMuted(!isSpeakerMuted);
                  if (!isSpeakerMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    setIsAiSpeaking(false);
                  }
                }}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-xl border backdrop-blur-md active:scale-95 ${
                  isSpeakerMuted
                    ? 'bg-rose-600/90 border-rose-500 text-white shadow-rose-600/30'
                    : 'bg-slate-900/85 border-slate-700/80 text-white hover:bg-slate-800'
                }`}
                title={isSpeakerMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
              >
                {isSpeakerMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              <button
                onClick={() => router.push('/results')}
                className="w-11 h-11 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition shadow-xl shadow-rose-600/40 border border-rose-400 active:scale-95"
                title="End Interview"
              >
                <PhoneOff size={18} />
              </button>
            </div>

            {/* Speaking Status Waveform Bar */}
            <div className="absolute bottom-2.5 z-20 flex items-center gap-2 text-xs font-semibold text-slate-200">
              <span className={isAiSpeaking ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                {isAiSpeaking ? `${currentAgent.name} AI is speaking...` : `${currentAgent.name} AI is listening to your answer`}
              </span>
              <div className="flex items-center gap-0.5 h-3">
                <span className={`w-0.5 bg-cyan-400 rounded-full transition-all ${isAiSpeaking ? 'h-full animate-bounce' : 'h-1'}`} />
                <span className={`w-0.5 bg-cyan-400 rounded-full transition-all ${isAiSpeaking ? 'h-2 animate-bounce' : 'h-1'}`} />
                <span className={`w-0.5 bg-cyan-400 rounded-full transition-all ${isAiSpeaking ? 'h-full animate-bounce' : 'h-1'}`} />
              </div>
            </div>

          </div>

          {/* EXPANDED CANDIDATE SPEECH CAPTURE BOX */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Candidate Speech Stream & Real-Time Intelligence
                </span>
              </div>
              <span className="text-[11px] px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                Continuous Transcribing Active
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 bg-slate-900/40 border border-cyan-500/20 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <MessageSquare size={14} /> Live Spoken Response ({candidateName})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Real-time Audio Sync</span>
                  </div>
                  <div className="min-h-[120px] max-h-[150px] overflow-y-auto bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-sm text-slate-100 font-normal leading-relaxed">
                    "{liveAnswer}"
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Target Concept: <strong className="text-white">{currentQ.keyConcept}</strong></span>
                  <span className="text-emerald-400 font-semibold">{liveGrammar}</span>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3">
                <div className="bg-slate-900/40 border border-amber-500/20 rounded-2xl p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle size={14} /> Evaluation Feedback
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {liveCorrection}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Accuracy:</span>
                    <span className="text-2xl font-black text-emerald-400">{liveAccuracy}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AGENT COLLABORATION DECISION WORKFLOW */}
          <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Zap size={14} className="text-purple-400" />
                <span>Tri-Agent Collaboration Pipeline</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                Active Interviewer: {currentAgent.name} ({currentAgent.role})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div 
                onClick={() => setSelectedAgentId('alex')}
                className={`bg-slate-950 border p-3 rounded-xl flex items-start gap-3 shadow-md cursor-pointer transition-all ${
                  selectedAgentId === 'alex' ? 'border-cyan-500 shadow-cyan-500/20 scale-[1.02]' : 'border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Code2 size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Alex (Tech Lead) {selectedAgentId === 'alex' && <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 rounded">Active</span>}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{currentQ.alexNote}</p>
                </div>
              </div>

              <div 
                onClick={() => setSelectedAgentId('emma')}
                className={`bg-slate-950 border p-3 rounded-xl flex items-start gap-3 shadow-md cursor-pointer transition-all ${
                  selectedAgentId === 'emma' ? 'border-purple-500 shadow-purple-500/20 scale-[1.02]' : 'border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <UserCheck size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Emma (Behavioral) {selectedAgentId === 'emma' && <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 rounded">Active</span>}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{currentQ.emmaNote}</p>
                </div>
              </div>

              <div 
                onClick={() => setSelectedAgentId('sarah')}
                className={`bg-slate-950 border p-3 rounded-xl flex items-start gap-3 shadow-md cursor-pointer transition-all ${
                  selectedAgentId === 'sarah' ? 'border-amber-500 shadow-amber-500/20 scale-[1.02]' : 'border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Briefcase size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Sarah (Hiring Lead) {selectedAgentId === 'sarah' && <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 rounded">Active</span>}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{currentQ.sarahNote}</p>
                </div>
              </div>
            </div>

            {/* Next Question CTA Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-3.5 flex items-center justify-between text-white shadow-xl">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200 block">NEXT QUESTION GENERATOR</span>
                <span className="text-xs font-semibold text-white">
                  Question {questionIndex + 1} of {questionsList.length} • Difficulty: Medium → <strong className="text-amber-300">Hard</strong>
                </span>
              </div>
              <button
                onClick={handleNextQuestion}
                className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition active:scale-95 shadow-md"
                title="Next Question"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </main>

        {/* RIGHT METRICS SIDEBAR */}
        <aside className="w-80 border-l border-slate-800/80 bg-[#060914] p-4 flex flex-col justify-between shrink-0 overflow-y-auto hidden xl:flex space-y-4">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" /> Live Dynamic Analysis
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-cyan-400" /> Communication
                </span>
                <span className="font-bold text-white">{liveScores.comm}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300" 
                  style={{ width: `${liveScores.comm}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Code2 size={13} className="text-blue-400" /> Technical Skills
                </span>
                <span className="font-bold text-white">{liveScores.tech}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300" 
                  style={{ width: `${liveScores.tech}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-purple-400" /> Confidence
                </span>
                <span className="font-bold text-white">{liveScores.conf}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300" 
                  style={{ width: `${liveScores.conf}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-400" /> Problem Solving
                </span>
                <span className="font-bold text-white">{liveScores.prob}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300" 
                  style={{ width: `${liveScores.prob}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Filler Words</span>
                <span className="text-sm font-bold text-white">~ {liveFiller}</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Speaking Pace</span>
                <span className="text-sm font-bold text-white">~ {liveWpm} WPM</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Emotion Status</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Smile size={14} /> {liveEmotion}
              </span>
            </div>
          </div>

          {/* SINE WAVE */}
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
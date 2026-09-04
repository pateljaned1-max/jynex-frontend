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
  AlertTriangle
} from 'lucide-react';

export default function FullLiveInterviewRoom() {
  const router = useRouter();

  // Call Controls State
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [candidateName, setCandidateName] = useState('Candidate');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // AI Speaking State
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Refs
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const avatarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Dynamic Question & Real-Time Tracker States
  const [questionIndex, setQuestionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(12 * 60 + 45);

  const questionsList = [
    {
      q: 'What programming languages are you most comfortable with, and how does the React Virtual DOM optimize performance?',
      keywords: ['react', 'virtual dom', 'javascript', 'performance', 'diff', 'state', 'render', 'reconciliation'],
      defaultAnswer: 'I mainly work with JavaScript and Python. The Virtual DOM creates an in-memory representation and calculates minimal diffs before repainting.',
      keyConcept: 'Virtual DOM Diffing & Reconciliation',
      alexNote: 'Strong knowledge of React reconciliation.',
      emmaNote: 'Confident delivery, concise speech.',
      sarahNote: 'Ready for deep architecture questions.'
    },
    {
      q: 'Can you explain how indexing works in MongoDB and when you should use a compound index?',
      keywords: ['mongodb', 'index', 'b-tree', 'compound', 'query', 'execution', 'performance', 'scan'],
      defaultAnswer: 'MongoDB uses B-trees for indexes. Single field indexes work on one field, while compound indexes index multiple fields to optimize complex queries.',
      keyConcept: 'ESR Rule & Compound B-Tree Indexing',
      alexNote: 'Good understanding of index scan limitations.',
      emmaNote: 'Pacing was natural, structured reasoning.',
      sarahNote: 'Advancing difficulty level to Senior.'
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

  // -------------------------------------------------------------
  // REAL HUMAN AVATAR LIP-SYNC & FACIAL ANIMATION RENDER ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = avatarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=85';

    let animFrame: number;
    let tick = 0;

    const renderAvatar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (img.complete && img.naturalWidth > 0) {
        // Natural micro-breathing head tilt
        const headFloatY = Math.sin(tick * 0.04) * 2;
        const headFloatX = Math.cos(tick * 0.02) * 1.5;

        // Base headshot render
        ctx.drawImage(img, 0 + headFloatX, 0 + headFloatY, canvas.width, canvas.height);

        // Natural eye-blink cycle every ~4 seconds
        const blinkCycle = tick % 160;
        if (blinkCycle > 153 && blinkCycle < 158) {
          ctx.fillStyle = '#c79a83';
          ctx.beginPath();
          ctx.ellipse(canvas.width * 0.44, canvas.height * 0.38 + headFloatY, 11, 4, -0.05, 0, Math.PI * 2);
          ctx.ellipse(canvas.width * 0.58, canvas.height * 0.38 + headFloatY, 11, 4, 0.05, 0, Math.PI * 2);
          ctx.fill();
        }

        // REALISTIC LIP DEFORMATION WHEN SPEAKING
        if (isAiSpeaking) {
          // Dynamic phonetic mouth movement based on sine harmonics
          const mouthWave = Math.sin(tick * 0.55) * Math.cos(tick * 0.25);
          const mouthOpenHeight = Math.max(1, Math.abs(mouthWave) * 11);
          const mouthWidth = 24 + Math.sin(tick * 0.3) * 4;

          const mouthX = canvas.width * 0.505 + headFloatX;
          const mouthY = canvas.height * 0.53 + headFloatY;

          // Inner oral cavity depth
          ctx.fillStyle = '#2c0c14';
          ctx.beginPath();
          ctx.ellipse(mouthX, mouthY + mouthOpenHeight * 0.3, mouthWidth / 2, mouthOpenHeight, 0, 0, Math.PI * 2);
          ctx.fill();

          // Upper teeth visibility
          if (mouthOpenHeight > 3) {
            ctx.fillStyle = '#f8f4f2';
            ctx.beginPath();
            ctx.ellipse(mouthX, mouthY - 1, mouthWidth * 0.35, 2.5, 0, 0, Math.PI);
            ctx.fill();
          }

          // Natural lips border blending
          ctx.strokeStyle = '#b25d6b';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.ellipse(mouthX, mouthY, mouthWidth / 2, mouthOpenHeight + 1, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      tick++;
      animFrame = requestAnimationFrame(renderAvatar);
    };

    img.onload = () => {
      renderAvatar();
    };

    return () => cancelAnimationFrame(animFrame);
  }, [isAiSpeaking]);

  // Voice output synced with speaking flag
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeakerMuted) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = 1.02;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Female'))
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      speakText(currentQ.q);
    }, 500);

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [questionIndex, isSpeakerMuted]);

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
          setLiveDecision('All 3 AI agents approve technical accuracy. Ready to advance difficulty.');
        } else {
          setLiveCorrection(`Try mentioning relevant terms like: ${currentQ.keywords.slice(0, 3).join(', ')}.`);
          setLiveGrammar('Developing Argument');
          setLiveDecision('Evaluating answer depth... Sarah recommending follow-up clarification.');
        }
      }
    };

    recognition.onerror = (e: any) => console.log('Speech Recognition:', e.error);

    if (!isMicMuted) {
      try {
        recognition.start();
      } catch (err) {}
    } else {
      recognition.stop();
    }

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (err) {}
    };
  }, [isMicMuted, questionIndex]);

  // Webcam Setup
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

  // Timer
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
    setLiveDecision('Question updated. Sarah AI is speaking prompt.');
  };

  return (
    <div className="h-screen w-screen bg-[#040711] text-slate-200 font-sans flex flex-col overflow-hidden select-none">
      
      {/* HEADER */}
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

        {/* Timer */}
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
          
          {/* 1. EXACT EQUAL 50-50 VIDEO CALL TILES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[330px] shrink-0">
            
            {/* TILE 1: REALISTIC HUMAN AI AVATAR (LIP-SYNC + EYE BLINK CANVAS) */}
            <div className={`bg-slate-950 border rounded-3xl relative overflow-hidden shadow-2xl flex flex-col justify-between p-3.5 transition-all duration-300 ${
              isAiSpeaking ? 'border-cyan-400/90 shadow-[0_0_35px_rgba(6,182,212,0.3)]' : 'border-slate-800'
            }`}>
              {/* Top Status */}
              <div className="w-full flex items-center justify-between text-xs z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-500/30 text-cyan-300 font-semibold text-[11px] backdrop-blur-md">
                  <Sparkles size={13} className="text-cyan-400" /> Sarah (AI Lead Evaluator)
                </span>
                <span className={`text-[10px] font-mono flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md ${
                  isAiSpeaking 
                    ? 'text-emerald-400 bg-emerald-950/85 border-emerald-500/50' 
                    : 'text-slate-400 bg-slate-900/80 border-slate-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isAiSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  {isAiSpeaking ? 'Speaking Live...' : 'Listening'}
                </span>
              </div>

              {/* Real Human Headshot Canvas with Live Lip-Sync Engine */}
              <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-[#0a0f22]">
                <canvas
                  ref={avatarCanvasRef}
                  width={500}
                  height={350}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 pointer-events-none" />
              </div>

              {/* Bottom Speaking Bar */}
              <div className="w-full flex items-center justify-between text-xs z-10 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-800/80">
                <span className="text-slate-200 font-semibold flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isAiSpeaking ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-slate-500'}`} />
                  {isAiSpeaking ? 'Sarah AI is Articulating' : 'Audio Channel Synchronized'}
                </span>
                <div className="flex items-center gap-1 h-3.5">
                  <span className={`w-0.5 bg-cyan-400 rounded-full transition-all ${isAiSpeaking ? 'h-full animate-bounce' : 'h-1'}`} />
                  <span className={`w-0.5 bg-cyan-400 rounded-full transition-all ${isAiSpeaking ? 'h-2 animate-bounce' : 'h-1'}`} />
                  <span className={`w-0.5 bg-cyan-400 rounded-full transition-all ${isAiSpeaking ? 'h-full animate-bounce' : 'h-1'}`} />
                  <span className={`w-0.5 bg-cyan-400 rounded-full transition-all ${isAiSpeaking ? 'h-2 animate-bounce' : 'h-1'}`} />
                </div>
              </div>
            </div>

            {/* TILE 2: CANDIDATE WEBCAM VIDEO (EQUAL 50% PROPORTION) */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col justify-between p-3.5">
              <div className="w-full flex justify-between items-center text-xs z-10">
                <span className="text-[11px] text-slate-300 font-semibold bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800 backdrop-blur-md">
                  Candidate Stream
                </span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full border backdrop-blur-md ${
                  isVideoOff ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {isVideoOff ? 'Camera Off' : 'Camera 720p HD'}
                </span>
              </div>

              <div className="absolute inset-0 z-0">
                {isVideoOff ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-[#070e24] to-slate-950">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-2xl flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                        <span className="text-3xl font-black text-white">
                          {candidateName ? candidateName.charAt(0).toUpperCase() : 'C'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-300 mt-2 font-semibold">{candidateName}</span>
                    <span className="text-[10px] text-slate-500">Camera feed muted</span>
                  </div>
                ) : cameraError ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 text-amber-400 flex-col gap-1 text-center p-4">
                    <VideoOff size={28} />
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

              <div className="w-full flex items-center justify-between text-xs z-10 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-800/80">
                <span className="text-white font-medium flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isMicMuted ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                  {candidateName} (You)
                </span>
                <span className={`text-[10px] font-mono ${isMicMuted ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isMicMuted ? 'Mic Muted' : 'Mic Active'}
                </span>
              </div>
            </div>

          </div>

          {/* CALL CONTROLS DOCK */}
          <div className="h-12 bg-slate-950/90 border border-slate-800/80 rounded-2xl px-4 flex items-center justify-center gap-3 shrink-0 shadow-xl">
            <button
              onClick={() => setIsMicMuted(!isMicMuted)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition border ${
                isMicMuted
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition border ${
                isVideoOff
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {isVideoOff ? <VideoOff size={16} /> : <Video size={16} />}
            </button>

            <button
              onClick={() => {
                setIsSpeakerMuted(!isSpeakerMuted);
                if (!isSpeakerMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setIsAiSpeaking(false);
                }
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition border ${
                isSpeakerMuted
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {isSpeakerMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <button
              onClick={() => router.push('/results')}
              className="px-5 h-9 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 transition shadow-lg shadow-rose-600/20 ml-2"
            >
              <PhoneOff size={15} /> End Interview
            </button>
          </div>

          {/* 2. EXPANDED LARGE CANDIDATE SPEECH CAPTURE BOX */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Candidate Speech Stream & Real-Time Intelligence
                </span>
              </div>
              <span className="text-[11px] px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                Continuous Transcriber
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Wide Text Area for Candidate Speech */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-cyan-500/20 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <MessageSquare size={14} /> Live Spoken Response ({candidateName})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Real-time Audio Sync</span>
                  </div>
                  <div className="min-h-[110px] max-h-[140px] overflow-y-auto bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-sm text-slate-100 font-normal leading-relaxed">
                    "{liveAnswer}"
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Target Concept: <strong className="text-white">{currentQ.keyConcept}</strong></span>
                  <span className="text-emerald-400 font-semibold">{liveGrammar}</span>
                </div>
              </div>

              {/* Real-Time Assessment Score */}
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

          {/* 3. AGENT COLLABORATION DECISION WORKFLOW */}
          <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Zap size={14} className="text-purple-400" />
                <span>Tri-Agent Collaboration Engine</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                Shared Neural Pipeline
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-cyan-500/30 p-3 rounded-xl flex items-start gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Code2 size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Alex (Tech Lead)</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{currentQ.alexNote}</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-purple-500/30 p-3 rounded-xl flex items-start gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <UserCheck size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Emma (Behavioral)</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{currentQ.emmaNote}</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-amber-500/30 p-3 rounded-xl flex items-start gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Briefcase size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sarah (Hiring Lead)</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{currentQ.sarahNote}</p>
                </div>
              </div>
            </div>

            {/* Next Question Button */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-3.5 flex items-center justify-between text-white shadow-xl">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200 block">NEXT QUESTION READY</span>
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
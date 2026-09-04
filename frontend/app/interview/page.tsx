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
  User,
  Sliders,
  Play
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://jynex-backend.onrender.com';

export default function FullLiveInterviewRoom() {
  const router = useRouter();

  const [isConfiguring, setIsConfiguring] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState('Full-Stack Engineering (React & Node.js)');
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [targetAgent, setTargetAgent] = useState<'sarah' | 'alex' | 'emma'>('sarah');

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [candidateName, setCandidateName] = useState('Candidate');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [selectedAgentId, setSelectedAgentId] = useState<'sarah' | 'alex' | 'emma'>('sarah');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const idleVideoRef = useRef<HTMLVideoElement | null>(null);
  const talkingVideoRef = useRef<HTMLVideoElement | null>(null);

  const agentsProfile = {
    sarah: {
      name: 'Sarah',
      role: 'Hiring Lead AI',
      gender: 'female' as const,
      poster: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=85',
      idleVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      talkingVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
    },
    alex: {
      name: 'Alex',
      role: 'Technical Lead AI',
      gender: 'male' as const,
      poster: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
      idleVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      talkingVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
    },
    emma: {
      name: 'Emma',
      role: 'Behavioral AI',
      gender: 'female' as const,
      poster: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=85',
      idleVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      talkingVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
    }
  };

  const currentAgent = agentsProfile[selectedAgentId];

  useEffect(() => {
    setSelectedAgentId(targetAgent);
  }, [targetAgent]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(selectedDuration * 60);

  useEffect(() => {
    setSecondsLeft(selectedDuration * 60);
  }, [selectedDuration]);

  const fallbackQuestions = [
    {
      q: `Let's discuss your experience in ${selectedTrack}. What programming languages are you most comfortable with, and how does the React Virtual DOM optimize performance?`,
      keywords: ['react', 'virtual dom', 'javascript', 'performance', 'diff', 'state', 'render', 'reconciliation'],
      keyConcept: 'Virtual DOM Diffing & Reconciliation',
      alexNote: 'Strong knowledge of React reconciliation algorithms.',
      emmaNote: 'Confident delivery, concise tone and pacing.',
      sarahNote: 'Ready for production-scale architecture questions.'
    },
    {
      q: 'Can you explain how indexing works in MongoDB and when you should use a compound index?',
      keywords: ['mongodb', 'index', 'b-tree', 'compound', 'query', 'execution', 'performance', 'scan'],
      keyConcept: 'ESR Rule & Compound B-Tree Indexing',
      alexNote: 'Good understanding of index scan limitations.',
      emmaNote: 'Pacing was natural with structured reasoning.',
      sarahNote: 'Advancing difficulty level to Senior evaluation tier.'
    },
    {
      q: 'How do you handle rate limiting in a microservices backend built with Node.js and Redis?',
      keywords: ['redis', 'token bucket', 'rate limit', 'sliding window', 'headers', '429', 'throttle'],
      keyConcept: 'Redis Token Bucket & HTTP 429',
      alexNote: 'Flawless Redis sliding window architecture.',
      emmaNote: 'Zero hesitations, authoritative tone.',
      sarahNote: 'Candidate clears technical bar with high marks.'
    }
  ];

  const [currentPrompt, setCurrentPrompt] = useState(fallbackQuestions[0].q);
  const currentQ = fallbackQuestions[questionIndex % fallbackQuestions.length];

  const [liveAnswer, setLiveAnswer] = useState('');
  const [liveAccuracy, setLiveAccuracy] = useState(92);
  const [liveCorrection, setLiveCorrection] = useState('Solid fundamentals. Add explicit real-world system tradeoffs for extra credit.');
  const [liveGrammar, setLiveGrammar] = useState('Clear & Technical');
  const [liveScores, setLiveScores] = useState({ comm: 88, tech: 92, conf: 90, prob: 86 });
  const [liveFiller, setLiveFiller] = useState(1);
  const [liveWpm, setLiveWpm] = useState(136);
  const [liveEmotion, setLiveEmotion] = useState('Calm & Focused');

  useEffect(() => {
    const saved = localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setCandidateName(parsed.name);
      } catch (e) {}
    }
  }, []);

  const handleEndInterview = async () => {
    setIsEvaluating(true);
    const sessionPayload = {
      candidateName: candidateName || 'Candidate',
      agentName: currentAgent.name,
      track: selectedTrack,
      transcript: liveAnswer,
      metrics: { wpm: liveWpm, fillerWords: liveFiller, accuracy: liveAccuracy }
    };

    let finalScorecard = {
      overallScore: liveAccuracy,
      technicalScore: liveScores.tech,
      communicationScore: liveScores.comm,
      confidenceScore: liveScores.conf,
      problemSolvingScore: liveScores.prob,
      fillerCount: liveFiller,
      wpm: liveWpm,
      track: selectedTrack,
      agentUsed: currentAgent.name,
      agentRole: currentAgent.role,
      lastAnswer: liveAnswer,
      keyConcept: currentQ.keyConcept,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    try {
      const evalRes = await fetch(`${BACKEND_URL}/api/interview/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionPayload)
      });
      if (evalRes.ok) {
        const evalData = await evalRes.json();
        finalScorecard = {
          ...finalScorecard,
          overallScore: evalData.overallScore ?? evalData.score ?? liveAccuracy,
          technicalScore: evalData.technicalScore ?? evalData.technical ?? liveScores.tech,
          communicationScore: evalData.communicationScore ?? evalData.communication ?? liveScores.comm,
          confidenceScore: evalData.confidenceScore ?? evalData.confidence ?? liveScores.conf,
          problemSolvingScore: evalData.problemSolvingScore ?? evalData.problemSolving ?? liveScores.prob,
          keyConcept: evalData.keyConcept || currentQ.keyConcept
        };
      }
    } catch (err) {
      console.warn('Backend evaluate offline:', err);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('latestInterviewResult', JSON.stringify(finalScorecard));
    }

    setIsEvaluating(false);
    router.push('/results');
  };

  useEffect(() => {
    if (!isConfiguring) {
      if (isAiSpeaking && talkingVideoRef.current) {
        talkingVideoRef.current.currentTime = 0;
        talkingVideoRef.current.play().catch(() => {});
      } else if (!isAiSpeaking && idleVideoRef.current) {
        idleVideoRef.current.play().catch(() => {});
      }
    }
  }, [isAiSpeaking, selectedAgentId, isConfiguring]);

  const speakText = (text: string, gender: 'male' | 'female' = 'female') => {
    if (isConfiguring || typeof window === 'undefined' || !('speechSynthesis' in window) || isSpeakerMuted) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    if (gender === 'male') {
      const maleVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('male')));
      if (maleVoice) utterance.voice = maleVoice;
      utterance.pitch = 0.8;
      utterance.rate = 1.0;
    } else {
      const femaleVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('female')));
      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.pitch = selectedAgentId === 'emma' ? 1.18 : 1.05;
      utterance.rate = 0.96;
    }

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isConfiguring) {
      const timer = setTimeout(() => speakText(currentPrompt, currentAgent.gender), 450);
      return () => {
        clearTimeout(timer);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
      };
    }
  }, [isConfiguring, currentPrompt, selectedAgentId, isSpeakerMuted]);

  useEffect(() => {
    if (isConfiguring || typeof window === 'undefined') return;
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
        setLiveAnswer(interimTranscript);
        const lower = interimTranscript.toLowerCase();
        const matched = currentQ.keywords.filter((kw) => lower.includes(kw));
        const matchRatio = Math.min(100, Math.max(65, Math.round(65 + (matched.length / currentQ.keywords.length) * 35)));
        setLiveAccuracy(matchRatio);
        const words = interimTranscript.split(/\s+/).length;
        setLiveWpm(Math.min(165, Math.max(110, Math.round(words * 3.2))));
        const fillerMatches = interimTranscript.match(/\b(um|uh|like|you know|actually|basically)\b/gi) || [];
        setLiveFiller(fillerMatches.length);
        setLiveScores({
          comm: Math.min(98, 80 + Math.round(words * 0.4)),
          tech: matchRatio,
          conf: Math.max(75, 96 - fillerMatches.length * 4),
          prob: Math.min(96, 82 + matched.length * 3)
        });
      }
    };

    if (!isMicMuted) {
      try { recognition.start(); } catch (err) {}
    } else {
      recognition.stop();
    }
    return () => { try { recognition.stop(); } catch (err) {} };
  }, [isConfiguring, isMicMuted, questionIndex, selectedAgentId]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
        mediaStreamRef.current = stream;
        if (userVideoRef.current) userVideoRef.current.srcObject = stream;
        setCameraError(null);
      } catch (err) {
        setCameraError('Camera access denied');
      }
    }

    if (!isVideoOff) {
      startCamera();
    } else if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [isVideoOff]);

  useEffect(() => {
    if (isConfiguring) return;
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
        step++;
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isConfiguring, isMicMuted]);

  useEffect(() => {
    if (isConfiguring) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isConfiguring]);

  const formatTimer = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = async () => {
    let nextPrompt = '';
    try {
      const res = await fetch(`${BACKEND_URL}/api/interview/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: currentAgent.name.toLowerCase(), previousAnswer: liveAnswer || '', topic: selectedTrack })
      });
      if (res.ok) {
        const data = await res.json();
        nextPrompt = data.question || data.text || '';
      }
    } catch (err) {
      console.warn('Backend question fetch failed:', err);
    }

    const nextIdx = (questionIndex + 1) % fallbackQuestions.length;
    setQuestionIndex(nextIdx);
    const fallbackData = fallbackQuestions[nextIdx];
    setCurrentPrompt(nextPrompt.trim().length > 0 ? nextPrompt : fallbackData.q);
    setLiveAnswer('');
    setLiveAccuracy(90);
  };

  return (
    <div className="h-screen w-screen bg-[#040711] text-slate-200 font-sans flex flex-col overflow-hidden select-none">
      {isConfiguring && (
        <div className="absolute inset-0 z-50 bg-[#040711]/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                <Sliders size={13} /> Session Configuration
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Configure Your Live Interview</h2>
              <p className="text-xs text-slate-400">Select your target track, duration, and AI interviewer.</p>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">Interview Track / Role</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {['Full-Stack Engineering (React & Node.js)', 'Distributed Systems & Microservices', 'Database Architecture (SQL vs NoSQL)', 'AI & Cloud Infrastructure'].map((track) => (
                    <button key={track} onClick={() => setSelectedTrack(track)} className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${selectedTrack === track ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-lg' : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'}`}>
                      {track}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">Session Duration</label>
                <div className="grid grid-cols-3 gap-3">
                  {[10, 15, 30].map((mins) => (
                    <button key={mins} onClick={() => setSelectedDuration(mins)} className={`py-2.5 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center gap-2 ${selectedDuration === mins ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'}`}>
                      <Clock size={14} /> {mins} Minutes
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">Lead AI Interviewer</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['sarah', 'alex', 'emma'] as const).map((agentKey) => {
                    const agent = agentsProfile[agentKey];
                    const isSelected = targetAgent === agentKey;
                    return (
                      <button key={agentKey} onClick={() => setTargetAgent(agentKey)} className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${isSelected ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg' : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'}`}>
                        <span className="text-xs font-bold">{agent.name}</span>
                        <span className="text-[10px] text-slate-400">{agent.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <button onClick={() => setIsConfiguring(false)} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition active:scale-[0.99]">
              <Play size={16} fill="white" /> Launch Live Interview Room
            </button>
          </div>
        </div>
      )}

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
            Live • {selectedTrack.split(' ')[0]} ({selectedDuration}m)
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-300 font-mono text-sm bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
            <Clock size={15} className="text-cyan-400" />
            <span className="font-bold text-white tracking-wider">{formatTimer(secondsLeft)}</span>
            <span className="text-xs text-slate-500">Remaining</span>
          </div>
        </div>
        <button onClick={handleEndInterview} disabled={isEvaluating} className="bg-rose-600/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 px-4 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg disabled:opacity-50">
          <PhoneOff size={14} /> {isEvaluating ? 'Evaluating...' : 'End Interview'}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-52 border-r border-slate-800/80 bg-[#060914] p-4 flex flex-col justify-between shrink-0 hidden lg:flex">
          <nav className="space-y-1.5">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 transition text-xs font-medium">
              <LayoutDashboard size={15} /> Dashboard
            </Link>
            <Link href="/interview" className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold shadow-lg">
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

        <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-gradient-to-b from-[#060a16] via-[#050812] to-[#03050c]">
          <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                <Bot size={14} className="text-cyan-400" /> Active Interviewer:
              </span>
              {(['sarah', 'alex', 'emma'] as const).map((agentKey) => {
                const isSelected = selectedAgentId === agentKey;
                const agentData = agentsProfile[agentKey];
                return (
                  <button key={agentKey} onClick={() => setSelectedAgentId(agentKey)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${isSelected ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
                    <span>{agentData.name} ({agentData.gender === 'male' ? 'Male' : 'Female'})</span>
                  </button>
                );
              })}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono pr-2">
              <span>Role:</span>
              <span className="text-cyan-300 font-bold">{currentAgent.role}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[340px] shrink-0">
            <div className={`bg-slate-950 border rounded-3xl relative overflow-hidden shadow-2xl flex flex-col justify-between p-3.5 transition-all ${isAiSpeaking ? 'border-cyan-400/90 shadow-[0_0_35px_rgba(6,182,212,0.3)]' : 'border-slate-800'}`}>
              <div className="w-full flex items-center justify-between text-xs z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-500/30 text-cyan-300 font-semibold text-[11px]">
                  <Sparkles size={13} className="text-cyan-400" /> {currentAgent.name} ({currentAgent.role})
                </span>
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${isAiSpeaking ? 'text-emerald-400 bg-emerald-950 border-emerald-500/50' : 'text-slate-400 bg-slate-900 border-slate-800'}`}>
                  {isAiSpeaking ? 'Speaking Live...' : 'Listening'}
                </span>
              </div>
              <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden bg-black">
                <img src={currentAgent.poster} alt={currentAgent.name} className="w-full h-full object-cover object-top absolute inset-0 z-0 brightness-95" />
                <video ref={idleVideoRef} src={currentAgent.idleVideo} autoPlay loop muted playsInline className={`w-full h-full object-cover object-top absolute inset-0 z-10 transition-opacity duration-300 ${isAiSpeaking ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} />
                <video ref={talkingVideoRef} src={currentAgent.talkingVideo} loop muted playsInline className={`w-full h-full object-cover object-top absolute inset-0 z-10 transition-opacity duration-300 ${isAiSpeaking ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 pointer-events-none" />
              </div>
              <div className="w-full flex items-center justify-between text-xs z-10 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-800">
                <span className="text-slate-200 font-semibold flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isAiSpeaking ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-slate-500'}`} />
                  {isAiSpeaking ? `${currentAgent.name} AI is Articulating` : 'Channel Active'}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col justify-between p-3.5">
              <div className="w-full flex justify-between items-center text-xs z-10">
                <span className="text-[11px] text-slate-300 font-semibold bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">Candidate Stream</span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full border ${isVideoOff ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                  {isVideoOff ? 'Camera Off' : 'Camera 720p HD'}
                </span>
              </div>
              <div className="absolute inset-0 z-0">
                {isVideoOff ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-300">
                    <span className="text-3xl font-black">{candidateName.charAt(0)}</span>
                  </div>
                ) : (
                  <video ref={userVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                )}
              </div>
              <div className="w-full flex items-center justify-between text-xs z-10 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-800">
                <span className="text-white font-medium flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isMicMuted ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                  {candidateName} (You)
                </span>
              </div>
            </div>
          </div>

          <div className="h-12 bg-slate-950/90 border border-slate-800 rounded-2xl px-4 flex items-center justify-center gap-3 shrink-0 shadow-xl">
            <button onClick={() => setIsMicMuted(!isMicMuted)} className={`w-9 h-9 rounded-xl flex items-center justify-center border ${isMicMuted ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-300'}`}>
              {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button onClick={() => setIsVideoOff(!isVideoOff)} className={`w-9 h-9 rounded-xl flex items-center justify-center border ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-300'}`}>
              {isVideoOff ? <VideoOff size={16} /> : <Video size={16} />}
            </button>
            <button onClick={() => setIsSpeakerMuted(!isSpeakerMuted)} className={`w-9 h-9 rounded-xl flex items-center justify-center border ${isSpeakerMuted ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-300'}`}>
              {isSpeakerMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button onClick={handleEndInterview} disabled={isEvaluating} className="px-5 h-9 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2">
              <PhoneOff size={15} /> {isEvaluating ? 'Evaluating...' : 'End Interview'}
            </button>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 bg-slate-900/40 border border-cyan-500/20 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <MessageSquare size={14} /> Live Spoken Response ({candidateName})
                    </span>
                  </div>
                  <div className="min-h-[110px] max-h-[140px] overflow-y-auto bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-sm text-slate-100">
                    "{liveAnswer}"
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Target Concept: <strong className="text-white">{currentQ.keyConcept}</strong></span>
                  <span className="text-emerald-400 font-semibold">{liveGrammar}</span>
                </div>
              </div>
              <div className="lg:col-span-4 bg-slate-900/40 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle size={14} /> Evaluation Feedback
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{liveCorrection}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Accuracy:</span>
                  <span className="text-2xl font-black text-emerald-400">{liveAccuracy}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Zap size={14} className="text-purple-400" />
                <span>Tri-Agent Collaboration Pipeline</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div onClick={() => setSelectedAgentId('alex')} className={`bg-slate-950 border p-3 rounded-xl flex items-start gap-3 shadow-md cursor-pointer ${selectedAgentId === 'alex' ? 'border-cyan-500' : 'border-slate-800'}`}>
                <Code2 size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Alex (Tech Lead)</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{currentQ.alexNote}</p>
                </div>
              </div>
              <div onClick={() => setSelectedAgentId('emma')} className={`bg-slate-950 border p-3 rounded-xl flex items-start gap-3 shadow-md cursor-pointer ${selectedAgentId === 'emma' ? 'border-purple-500' : 'border-slate-800'}`}>
                <UserCheck size={15} className="text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Emma (Behavioral)</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{currentQ.emmaNote}</p>
                </div>
              </div>
              <div onClick={() => setSelectedAgentId('sarah')} className={`bg-slate-950 border p-3 rounded-xl flex items-start gap-3 shadow-md cursor-pointer ${selectedAgentId === 'sarah' ? 'border-amber-500' : 'border-slate-800'}`}>
                <Briefcase size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Sarah (Hiring Lead)</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{currentQ.sarahNote}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-3.5 flex items-center justify-between text-white shadow-xl">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200 block">NEXT QUESTION GENERATOR</span>
                <span className="text-xs font-semibold text-white">Question {questionIndex + 1} • Topic: <strong className="text-amber-300">{currentQ.keyConcept}</strong></span>
              </div>
              <button onClick={handleNextQuestion} className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </main>

        <aside className="w-80 border-l border-slate-800/80 bg-[#060914] p-4 flex flex-col justify-between shrink-0 overflow-y-auto hidden xl:flex space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" /> Live Dynamic Analysis
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Communication</span>
                <span className="font-bold text-white">{liveScores.comm}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${liveScores.comm}%` }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Technical Skills</span>
                <span className="font-bold text-white">{liveScores.tech}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${liveScores.tech}%` }} />
              </div>
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
              <span className="flex items-center gap-1.5"><Mic size={14} className="text-cyan-400" /> Voice Activity</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl flex items-center justify-center">
              <canvas ref={canvasRef} width={260} height={36} className="w-full h-9" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
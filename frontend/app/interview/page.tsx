'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
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
  MessageSquare
} from 'lucide-react';

export default function LiveInterviewCallRoom() {
  const router = useRouter();

  // Call states
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [candidateName, setCandidateName] = useState('Candidate');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Video Refs
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Question & Evaluation State
  const [questionIndex, setQuestionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(12 * 60 + 45);

  const questionsList = [
    {
      q: 'What programming languages are you most comfortable with, and how does the React Virtual DOM optimize performance?',
      userAnswer: 'I mainly work with JavaScript and Python. The Virtual DOM creates an in-memory representation and calculates minimal diffs before repainting.',
      correction: 'Great explanation of reconciliation! You could also mention Fiber architecture and batch updating for bonus points.',
      accuracy: 94,
      grammar: 'Clean & Concise',
      keyConcept: 'Virtual DOM Diffing & Reconciliation'
    },
    {
      q: 'Can you explain the difference between SQL and NoSQL indexing strategies?',
      userAnswer: 'SQL uses B-Trees mostly for relational constraints. NoSQL databases like MongoDB use compound and single field indexes with flexible schema.',
      correction: 'Correct fundamentals. Clarify read-heavy vs write-heavy tradeoffs and memory footprint during high concurrency.',
      accuracy: 88,
      grammar: 'Good technical clarity',
      keyConcept: 'B-Trees vs Inverted Indices'
    }
  ];

  const currentData = questionsList[questionIndex];

  // Load username dynamically
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

  // Real Webcam Setup for Candidate Tile
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
      } catch (err) {
        console.error('Webcam permission error:', err);
        setCameraError('Camera access denied or device not found');
      }
    }

    if (!isVideoOff) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOff]);

  // Video track toggle
  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsVideoOff((prev) => !prev);
  };

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
    setQuestionIndex((prev) => (prev + 1) % questionsList.length);
  };

  return (
    <div className="h-screen w-screen bg-[#070913] text-slate-200 font-sans flex flex-col overflow-hidden select-none">
      
      {/* 1. TOP HEADER */}
      <header className="h-12 border-b border-slate-800/80 bg-[#0a0d1d]/90 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Live AI Assessment</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">|</span>
          <span className="text-xs text-cyan-400 font-mono font-medium">Session ID: #JYN-9023</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-lg text-xs font-mono">
            <Clock size={13} className="text-cyan-400" />
            <span className="text-white font-semibold">{formatTimer(secondsLeft)}</span>
            <span className="text-slate-500">Remaining</span>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition">
            <BookOpen size={13} /> Guidelines
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition">
            <HelpCircle size={13} /> Support
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">

        {/* LEFT COLUMN: CALL SCREEN + CORRECTION TRACKER */}
        <div className="flex-[3] flex flex-col gap-3 min-w-0">
          
          {/* VIDEO STREAM TILES */}
          <div className="h-[52%] grid grid-cols-2 gap-3 min-h-0">
            
            {/* AI Interviewer Video Tile (Talking Video Stream) */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl relative overflow-hidden shadow-xl flex flex-col justify-between p-4">
              <div className="w-full flex items-center justify-between text-xs z-10">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium text-[10px]">
                  <Sparkles size={11} /> AI Interviewer
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Speaking
                </span>
              </div>

              {/* Realistic Talking Interviewer Video Feed */}
              <div className="absolute inset-0 z-0">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  src="https://assets.mixkit.co/videos/preview/mixkit-business-woman-talking-on-a-video-call-42861-large.mp4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
              </div>

              {/* Bottom Tag */}
              <div className="w-full flex items-center justify-between text-xs z-10 bg-slate-950/60 backdrop-blur-md p-2 rounded-xl border border-slate-800/60">
                <span className="text-slate-200 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                  Sarah (AI Technical Lead)
                </span>
                
                {/* Audio Equalizer */}
                <div className="flex items-center gap-1 h-3">
                  <span className="w-0.5 bg-cyan-400 h-full animate-pulse" />
                  <span className="w-0.5 bg-cyan-400 h-2 animate-pulse" />
                  <span className="w-0.5 bg-cyan-400 h-3 animate-pulse" />
                  <span className="w-0.5 bg-cyan-400 h-1 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Candidate Stream Tile (Actual Webcam Feed) */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl relative overflow-hidden shadow-xl flex flex-col justify-between p-4">
              <div className="w-full flex justify-between items-center text-xs z-10">
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                  HD Live Camera
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Candidate View
                </span>
              </div>

              {/* Real-time Webcam element */}
              <div className="absolute inset-0 z-0">
                {isVideoOff ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-500 flex-col gap-2">
                    <VideoOff size={32} />
                    <span className="text-xs">Camera is turned off</span>
                  </div>
                ) : cameraError ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 text-amber-400/80 flex-col gap-2 p-4 text-center">
                    <VideoOff size={30} />
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

              {/* Bottom Tag */}
              <div className="w-full flex items-center justify-between text-xs z-10 bg-slate-950/60 backdrop-blur-md p-2 rounded-xl border border-slate-800/60">
                <span className="text-white font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {candidateName}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Microphone Active</span>
              </div>
            </div>

          </div>

          {/* CALL CONTROLS BAR */}
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
              onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition border ${
                isSpeakerMuted
                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {isSpeakerMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            <button
              onClick={() => router.push('/results')}
              className="px-4 h-9 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-lg shadow-rose-600/20"
            >
              <PhoneOff size={14} /> End Call
            </button>
          </div>

          {/* REALTIME QUESTION CORRECTION & TRACK PANEL */}
          <div className="flex-1 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Live Answer Correction & Concept Tracker
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                Model: Jynex AI Evaluator
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-auto py-2 text-xs">
              {/* Candidate Answer Captured */}
              <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <MessageSquare size={12} className="text-blue-400" /> Your Speech Response
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed italic">
                  "{currentData.userAnswer}"
                </p>
              </div>

              {/* AI Real-time Correction */}
              <div className="bg-slate-900/50 border border-amber-500/20 p-3 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <AlertTriangle size={12} /> AI Live Correction / Addition
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {currentData.correction}
                </p>
              </div>

              {/* Concept & Accuracy */}
              <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                    <TrendingUp size={12} className="text-emerald-400" /> Answer Match & Accuracy
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-black text-emerald-400">{currentData.accuracy}%</span>
                    <span className="text-[10px] text-slate-400">{currentData.grammar}</span>
                  </div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
                  Concept: <span className="text-white font-medium">{currentData.keyConcept}</span>
                </div>
              </div>
            </div>

            {/* Next Question Simulation Trigger */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-500">Practice questions switch dynamically as you speak</span>
              <button
                onClick={handleNextQuestion}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-blue-600/20"
              >
                Next Question <ArrowRight size={13} />
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: TRANSCRIPTION & DIALOGUE PANEL */}
        <aside className="flex-[1.2] bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shrink-0 min-w-[300px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" /> Transcriptions
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Live Sync</span>
            </div>

            {/* Chat Transcript Stream */}
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-170px)] pr-1">
              
              {/* AI Intro Bubble */}
              <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-2xl rounded-tl-none space-y-1.5">
                <span className="text-[10px] font-bold text-cyan-400 block">Sarah (AI Technical Lead)</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Hi, I'll be your AI interviewer today. This interview is designed to evaluate your system understanding and core programming depth.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You'll have about two minutes to respond to each prompt. Are you ready to get started?
                </p>
              </div>

              {/* Active Question Bubble */}
              <div className="bg-gradient-to-r from-blue-950/40 to-slate-900/80 border border-blue-500/30 p-3 rounded-2xl rounded-tl-none space-y-1">
                <span className="text-[10px] font-bold text-blue-400 block">Current Question</span>
                <p className="text-xs text-white font-medium leading-relaxed">
                  "{currentData.q}"
                </p>
              </div>

              {/* User Live Transcription Bubble */}
              <div className="bg-slate-900/40 border border-slate-800/60 p-3 rounded-2xl rounded-tr-none ml-4 space-y-1 text-right">
                <span className="text-[10px] font-bold text-slate-400 block">{candidateName} (Speaking)</span>
                <p className="text-xs text-slate-300 leading-relaxed text-left">
                  {currentData.userAnswer}
                </p>
              </div>

            </div>
          </div>

          {/* Bottom Activity Status */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Continuous Transcription
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Confidence: 98%</span>
          </div>
        </aside>

      </div>
    </div>
  );
}
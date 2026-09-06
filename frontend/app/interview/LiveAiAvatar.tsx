'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Clock,
  Sparkles,
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
  Sliders,
  Play
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://jynex-backend.onrender.com';

/* -------------------------------------------------------------------------- */
/*                    FULL-FRAME LIVE AI AVATAR ENGINE                        */
/* -------------------------------------------------------------------------- */

interface LiveAiAvatarProps {
  persona: 'alex' | 'emma' | 'sarah';
  isSpeaking: boolean;
  isCandidateSpeaking: boolean;
  remoteVideoTrack?: any;
}

interface PersonaConfig {
  name: string;
  role: string;
  gender: 'male' | 'female';
  imageUrl: string;
  mouth: {
    cx: number;
    cy: number;
    w: number;
    h: number;
  };
  eyes: {
    leftX: number;
    rightX: number;
    y: number;
    w: number;
    h: number;
  };
  skinTone: string;
  lipColor: string;
  lipHighlight: string;
}

const PERSONAS: Record<'alex' | 'emma' | 'sarah', PersonaConfig> = {
  alex: {
    name: 'Alex',
    role: 'Technical Lead',
    gender: 'male',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    mouth: { cx: 0.50, cy: 0.655, w: 0.16, h: 0.055 },
    eyes: { leftX: 0.43, rightX: 0.57, y: 0.42, w: 0.065, h: 0.03 },
    skinTone: 'rgb(222, 178, 150)',
    lipColor: 'rgba(180, 110, 100, 0.85)',
    lipHighlight: 'rgba(215, 145, 135, 0.4)'
  },
  emma: {
    name: 'Emma',
    role: 'Behavioral Lead',
    gender: 'female',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    mouth: { cx: 0.50, cy: 0.635, w: 0.155, h: 0.05 },
    eyes: { leftX: 0.43, rightX: 0.57, y: 0.40, w: 0.065, h: 0.03 },
    skinTone: 'rgb(230, 192, 172)',
    lipColor: 'rgba(195, 105, 115, 0.88)',
    lipHighlight: 'rgba(230, 140, 150, 0.45)'
  },
  sarah: {
    name: 'Sarah',
    role: 'Hiring Lead',
    gender: 'female',
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80',
    mouth: { cx: 0.495, cy: 0.64, w: 0.15, h: 0.048 },
    eyes: { leftX: 0.43, rightX: 0.56, y: 0.41, w: 0.065, h: 0.03 },
    skinTone: 'rgb(225, 185, 165)',
    lipColor: 'rgba(185, 95, 105, 0.88)',
    lipHighlight: 'rgba(220, 135, 140, 0.45)'
  }
};

function LiveAiAvatar({
  persona,
  isSpeaking,
  isCandidateSpeaking,
  remoteVideoTrack
}: LiveAiAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [eqLevels, setEqLevels] = useState<number[]>([15, 25, 45, 30, 20]);
  const remoteVideoContainerRef = useRef<HTMLDivElement | null>(null);

  const personaConfig = PERSONAS[persona] || PERSONAS.alex;

  // Preload persona image
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = personaConfig.imageUrl;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
  }, [personaConfig.imageUrl]);

  // Agora remote video attachment if provided
  useEffect(() => {
    if (remoteVideoTrack && remoteVideoContainerRef.current) {
      remoteVideoTrack.play(remoteVideoContainerRef.current);
      return () => {
        try {
          remoteVideoTrack.stop();
        } catch (e) {}
      };
    }
  }, [remoteVideoTrack]);

  // Dynamic Audio Visualizer bars animation
  useEffect(() => {
    if (!isSpeaking) {
      setEqLevels([6, 8, 10, 8, 6]);
      return;
    }

    const interval = setInterval(() => {
      setEqLevels([
        Math.floor(10 + Math.random() * 85),
        Math.floor(20 + Math.random() * 95),
        Math.floor(35 + Math.random() * 100),
        Math.floor(25 + Math.random() * 90),
        Math.floor(15 + Math.random() * 75)
      ]);
    }, 90);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Realistic Canvas Avatar Engine (Lip-Sync, Blinking, Breathing, Nodding)
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();
    let nextBlinkTime = startTime + 3000 + Math.random() * 2000;
    let blinkDuration = 160; // ms
    let currentMouthOpen = 0; // smoothed openness 0..1
    let currentMouthWidth = 1; // smoothed phoneme width modifier

    const render = (time: number) => {
      const img = imageRef.current;
      if (!img) return;

      const cw = canvas.width;
      const ch = canvas.height;

      // Calculate object-cover dimensions
      const imgRatio = img.width / img.height;
      const canvasRatio = cw / ch;
      let renderW = cw;
      let renderH = ch;
      let offX = 0;
      let offY = 0;

      if (imgRatio > canvasRatio) {
        renderH = ch;
        renderW = ch * imgRatio;
        offX = (cw - renderW) / 2;
      } else {
        renderW = cw;
        renderH = cw / imgRatio;
        offY = (ch - renderH) / 2;
      }

      // Micro-breathing and subtle sway
      const breathing = Math.sin(time * 0.0018) * 1.5;
      const sway = Math.cos(time * 0.0012) * 1.0;

      // Affirmatory listening nod when candidate speaks
      let nod = 0;
      if (isCandidateSpeaking && !isSpeaking) {
        nod = Math.sin(time * 0.007) * 2.8;
      }

      ctx.save();
      ctx.clearRect(0, 0, cw, ch);

      // Draw base photo with subtle transform
      ctx.translate(sway, breathing + nod);
      ctx.drawImage(img, offX, offY, renderW, renderH);

      // Lip-Sync Viseme Calculation
      let targetMouthOpen = 0;
      let targetMouthWidth = 1.0;

      if (isSpeaking) {
        // Multi-frequency harmonic wave simulating natural phoneme & syllable cadence
        const w1 = Math.sin(time * 0.019) * 0.45;
        const w2 = Math.cos(time * 0.029) * 0.35;
        const w3 = Math.sin(time * 0.011) * 0.25;
        const rawOpen = Math.max(0, w1 + w2 + w3);
        targetMouthOpen = Math.min(1.0, rawOpen * 1.3);

        // Viseme width variation (AA vs OO vs EE)
        targetMouthWidth = 0.88 + Math.sin(time * 0.023) * 0.24;
      }

      // Smooth interpolation for fluid lifelike mouth motion
      currentMouthOpen += (targetMouthOpen - currentMouthOpen) * 0.28;
      currentMouthWidth += (targetMouthWidth - currentMouthWidth) * 0.25;

      const mCfg = personaConfig.mouth;
      const mouthCenterX = offX + renderW * mCfg.cx;
      const mouthCenterY = offY + renderH * mCfg.cy;
      const baseMouthW = renderW * mCfg.w;
      const baseMouthH = renderH * mCfg.h;

      // Dynamic mouth render if speaking or settling
      if (currentMouthOpen > 0.04) {
        const mw = (baseMouthW * currentMouthWidth) / 2;
        const maxOpenH = baseMouthH * (1.2 + currentMouthOpen * 1.8);
        const openH = maxOpenH * currentMouthOpen;

        ctx.save();

        // Subtle jaw drop shading
        const jawGrad = ctx.createRadialGradient(
          mouthCenterX, mouthCenterY + openH * 0.6, 2,
          mouthCenterX, mouthCenterY + openH * 0.6, mw * 1.4
        );
        jawGrad.addColorStop(0, 'rgba(0,0,0,0.18)');
        jawGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = jawGrad;
        ctx.beginPath();
        ctx.ellipse(mouthCenterX, mouthCenterY + openH * 0.6, mw * 1.2, openH * 1.1, 0, 0, Math.PI * 2);
        ctx.fill();

        // 1. Inner Oral Cavity
        ctx.beginPath();
        ctx.moveTo(mouthCenterX - mw, mouthCenterY);
        ctx.bezierCurveTo(
          mouthCenterX - mw * 0.5, mouthCenterY - openH * 0.35,
          mouthCenterX + mw * 0.5, mouthCenterY - openH * 0.35,
          mouthCenterX + mw, mouthCenterY
        );
        ctx.bezierCurveTo(
          mouthCenterX + mw * 0.6, mouthCenterY + openH,
          mouthCenterX - mw * 0.6, mouthCenterY + openH,
          mouthCenterX - mw, mouthCenterY
        );
        ctx.closePath();

        const oralGrad = ctx.createLinearGradient(mouthCenterX, mouthCenterY - openH * 0.3, mouthCenterX, mouthCenterY + openH);
        oralGrad.addColorStop(0, '#150505');
        oralGrad.addColorStop(0.6, '#280c0d');
        oralGrad.addColorStop(1, '#1b0708');
        ctx.fillStyle = oralGrad;
        ctx.fill();

        // 2. Realistic Upper Teeth
        if (currentMouthOpen > 0.12) {
          const teethW = mw * 0.65;
          const teethH = Math.min(openH * 0.45, 9);
          ctx.beginPath();
          ctx.moveTo(mouthCenterX - teethW, mouthCenterY - openH * 0.05);
          ctx.lineTo(mouthCenterX + teethW, mouthCenterY - openH * 0.05);
          ctx.bezierCurveTo(
            mouthCenterX + teethW * 0.8, mouthCenterY + teethH,
            mouthCenterX - teethW * 0.8, mouthCenterY + teethH,
            mouthCenterX - teethW, mouthCenterY - openH * 0.05
          );
          ctx.closePath();
          ctx.fillStyle = 'rgba(245, 243, 238, 0.94)';
          ctx.fill();

          ctx.strokeStyle = 'rgba(120, 100, 95, 0.35)';
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(mouthCenterX, mouthCenterY - openH * 0.05);
          ctx.lineTo(mouthCenterX, mouthCenterY + teethH * 0.85);
          ctx.stroke();
        }

        // 3. Lower Tongue Highlight
        if (currentMouthOpen > 0.25) {
          ctx.beginPath();
          ctx.ellipse(mouthCenterX, mouthCenterY + openH * 0.75, mw * 0.42, openH * 0.22, 0, 0, Math.PI);
          ctx.fillStyle = 'rgba(180, 85, 95, 0.75)';
          ctx.fill();
        }

        // 4. Upper Lip Overlay Contour
        ctx.beginPath();
        ctx.moveTo(mouthCenterX - mw * 1.05, mouthCenterY);
        ctx.bezierCurveTo(
          mouthCenterX - mw * 0.4, mouthCenterY - baseMouthH * 0.55,
          mouthCenterX - mw * 0.1, mouthCenterY - baseMouthH * 0.65,
          mouthCenterX, mouthCenterY - baseMouthH * 0.5
        );
        ctx.bezierCurveTo(
          mouthCenterX + mw * 0.1, mouthCenterY - baseMouthH * 0.65,
          mouthCenterX + mw * 0.4, mouthCenterY - baseMouthH * 0.55,
          mouthCenterX + mw * 1.05, mouthCenterY
        );
        ctx.bezierCurveTo(
          mouthCenterX + mw * 0.5, mouthCenterY - openH * 0.3,
          mouthCenterX - mw * 0.5, mouthCenterY - openH * 0.3,
          mouthCenterX - mw * 1.05, mouthCenterY
        );
        ctx.closePath();
        ctx.fillStyle = personaConfig.lipColor;
        ctx.fill();

        // 5. Lower Lip Overlay Contour
        ctx.beginPath();
        ctx.moveTo(mouthCenterX - mw * 1.02, mouthCenterY);
        ctx.bezierCurveTo(
          mouthCenterX - mw * 0.5, mouthCenterY + openH,
          mouthCenterX + mw * 0.5, mouthCenterY + openH,
          mouthCenterX + mw * 1.02, mouthCenterY
        );
        ctx.bezierCurveTo(
          mouthCenterX + mw * 0.6, mouthCenterY + openH + baseMouthH * 0.75,
          mouthCenterX - mw * 0.6, mouthCenterY + openH + baseMouthH * 0.75,
          mouthCenterX - mw * 1.02, mouthCenterY
        );
        ctx.closePath();
        ctx.fillStyle = personaConfig.lipColor;
        ctx.fill();

        // Lip highlight
        ctx.beginPath();
        ctx.ellipse(mouthCenterX, mouthCenterY + openH + baseMouthH * 0.35, mw * 0.35, baseMouthH * 0.18, 0, 0, Math.PI * 2);
        ctx.fillStyle = personaConfig.lipHighlight;
        ctx.fill();

        ctx.restore();
      }

      // Natural Human Eye Blinking
      if (time > nextBlinkTime) {
        const blinkProgress = (time - nextBlinkTime) / blinkDuration;
        if (blinkProgress <= 1.0) {
          const blinkFactor = Math.sin(blinkProgress * Math.PI);
          const eCfg = personaConfig.eyes;
          const leftEyeX = offX + renderW * eCfg.leftX;
          const rightEyeX = offX + renderW * eCfg.rightX;
          const eyeY = offY + renderH * eCfg.y;
          const eyeW = renderW * eCfg.w;
          const eyeH = renderH * eCfg.h * blinkFactor;

          ctx.save();
          ctx.fillStyle = personaConfig.skinTone;

          // Left eyelid
          ctx.beginPath();
          ctx.ellipse(leftEyeX, eyeY, eyeW, Math.max(1, eyeH), 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(50, 35, 30, 0.65)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(leftEyeX, eyeY + eyeH * 0.5, eyeW * 0.9, 1.5, 0, 0, Math.PI);
          ctx.stroke();

          // Right eyelid
          ctx.beginPath();
          ctx.ellipse(rightEyeX, eyeY, eyeW, Math.max(1, eyeH), 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(50, 35, 30, 0.65)';
          ctx.beginPath();
          ctx.ellipse(rightEyeX, eyeY + eyeH * 0.5, eyeW * 0.9, 1.5, 0, 0, Math.PI);
          ctx.stroke();

          ctx.restore();
        } else {
          nextBlinkTime = time + 3200 + Math.random() * 2300;
        }
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [imageLoaded, isSpeaking, isCandidateSpeaking, personaConfig]);

  return (
    <div
      className={`bg-slate-950 border rounded-2xl relative overflow-hidden shadow-2xl flex flex-col justify-between p-3.5 transition-all duration-300 ${
        isSpeaking
          ? 'border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.28)]'
          : 'border-slate-800/90'
      }`}
    >
      {/* TOP METADATA BAR (SLEEK PROFESSIONAL OVERLAY) */}
      <div className="w-full flex items-center justify-between text-xs z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 font-semibold text-[11px] shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <Sparkles size={11} className="text-cyan-400" />
          <span>AI Interviewer ({persona.toUpperCase()})</span>
        </div>

        <div
          className={`text-[10px] font-mono flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border shadow-lg ${
            isSpeaking
              ? 'text-emerald-300 bg-emerald-950/80 border-emerald-500/50'
              : 'text-slate-300 bg-slate-950/80 border-slate-800'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isSpeaking
                ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]'
                : 'bg-emerald-500/70'
            }`}
          />
          <span className="font-medium">
            {isSpeaking ? 'Speaking Live...' : 'Listening via Agora VAD'}
          </span>
        </div>
      </div>

      {/* FULL-FRAME VIDEO/CANVAS AVATAR STREAM */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
        {remoteVideoTrack ? (
          <div ref={remoteVideoContainerRef} className="w-full h-full object-cover" />
        ) : (
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        )}

        {/* Subtle Depth Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-transparent to-slate-950/30 pointer-events-none" />
      </div>

      {/* BOTTOM FLOATING STATUS BAR WITH AUDIO EQUALIZER */}
      <div className="w-full flex items-center justify-between text-xs z-10 bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSpeaking
                  ? 'bg-emerald-400 shadow-[0_0_10px_#10b981] animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
          </div>
          <div>
            <span className="text-white font-bold text-xs block leading-tight">
              {personaConfig.name} ({personaConfig.role})
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              {isSpeaking ? `${personaConfig.name} is speaking...` : 'Evaluating candidate responses in real time'}
            </span>
          </div>
        </div>

        {/* Dynamic Multi-Bar Frequency Equalizer */}
        <div className="flex items-end gap-1 h-5 px-2 py-0.5 bg-slate-900/80 rounded-lg border border-slate-800/70">
          {eqLevels.map((lvl, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-100 ${
                isSpeaking
                  ? 'bg-gradient-to-t from-cyan-500 to-emerald-400'
                  : 'bg-slate-600'
              }`}
              style={{
                height: `${Math.max(15, lvl)}%`,
                opacity: isSpeaking ? 1 : 0.4
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                    QUESTION BANK & GENERATION LOGIC                        */
/* -------------------------------------------------------------------------- */

export interface QuestionItem {
  q: string;
  keywords: string[];
  defaultAnswer: string;
  keyConcept: string;
  alexNote: string;
  emmaNote: string;
  sarahNote: string;
}

const TRACK_QUESTIONS: Record<string, QuestionItem[]> = {
  'Full-Stack Engineering (React & Node.js)': [
    {
      q: "Let's discuss your experience in Full-Stack Engineering (React & Node.js). What programming languages are you most comfortable with, and how does the React Virtual DOM optimize performance?",
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
    },
    {
      q: 'When managing application state in complex React apps, how do you evaluate React Context vs Redux Toolkit vs Zustand, and how do you prevent unwanted component re-renders?',
      keywords: ['state', 'context', 'redux', 'zustand', 're-render', 'selectors', 'memo', 'usecallback', 'usememo'],
      defaultAnswer: 'Context is great for low-frequency global data like theme or auth. For complex high-frequency updates, Zustand or Redux Toolkit with atomic state selectors and React.memo prevent subtree re-rendering.',
      keyConcept: 'Atomic State Management & Re-render Minimization',
      alexNote: 'Deep appreciation of state atomicity and rendering lifecycles.',
      emmaNote: 'Logical breakdown comparing trade-offs naturally.',
      sarahNote: 'Shows practical software craftsmanship experience.'
    },
    {
      q: 'Could you walk me through the Node.js Event Loop phases, specifically how libuv prioritizes the Microtask queue over the Macrotask queue?',
      keywords: ['event loop', 'libuv', 'microtask', 'macrotask', 'process.nexttick', 'promise', 'setimmediate', 'timers'],
      defaultAnswer: 'The Node.js event loop runs in distinct phases: timers, pending callbacks, poll, check, and close. Between every phase, libuv drains the microtask queue—prioritizing process.nextTick and Promise callbacks before executing macrotasks.',
      keyConcept: 'libuv Event Loop & Microtask Draining',
      alexNote: 'Spot-on explanation of process.nextTick and promise draining.',
      emmaNote: 'Articulate delivery on an intricate low-level topic.',
      sarahNote: 'Solid understanding of backend runtime internals.'
    },
    {
      q: 'How do Server-Side Rendering (SSR), Static Site Generation (SSG), and Incremental Static Regeneration (ISR) differ in Next.js, and how do you troubleshoot hydration errors?',
      keywords: ['ssr', 'ssg', 'isr', 'next.js', 'hydration', 'server', 'client', 'cache', 'revalidate'],
      defaultAnswer: 'SSG generates static HTML at build time, SSR creates HTML per-request on the server, and ISR revalidates static pages in the background after a specified interval. Hydration errors occur when server-rendered HTML diverges from initial client state.',
      keyConcept: 'Rendering Strategies & Client-Server Hydration',
      alexNote: 'Comprehensive understanding of modern Next.js rendering architectures.',
      emmaNote: 'Concise and structured answer without hesitation.',
      sarahNote: 'Demonstrates practical production experience with Next.js.'
    },
    {
      q: 'How do you handle database concurrency, race conditions, and idempotency in an e-commerce checkout flow with multiple simultaneous write requests?',
      keywords: ['concurrency', 'race condition', 'idempotency', 'acid', 'transaction', 'optimistic', 'pessimistic', 'lock'],
      defaultAnswer: 'I use database transactions with optimistic locking via version numbers, combined with distributed idempotency keys in Redis to ensure duplicate requests produce consistent results without double deductions.',
      keyConcept: 'Optimistic Concurrency & Idempotency Keys',
      alexNote: 'Robust solution covering both database locks and network retries.',
      emmaNote: 'Methodical risk mitigation perspective.',
      sarahNote: 'Instills confidence in handling critical business financial workflows.'
    },
    {
      q: 'What are the main security vulnerabilities you safeguard against in modern full-stack web applications, and how do you mitigate XSS, CSRF, and CORS issues?',
      keywords: ['security', 'xss', 'csrf', 'cors', 'sanitize', 'jwt', 'httponly', 'csp', 'headers'],
      defaultAnswer: 'I mitigate XSS through automated HTML sanitization and Content Security Policy headers, defend against CSRF with SameSite HttpOnly cookies or anti-CSRF tokens, and enforce strict origin whitelisting on CORS headers.',
      keyConcept: 'Defense-in-Depth Web Security & CSP',
      alexNote: 'Strong modern security hygiene across frontend and backend.',
      emmaNote: 'Calm, authoritative communication of compliance standards.',
      sarahNote: 'High marks on security awareness and threat mitigation.'
    },
    {
      q: 'When building real-time applications, how do you decide between WebSockets, Server-Sent Events (SSE), and Long Polling?',
      keywords: ['websocket', 'sse', 'polling', 'real-time', 'bidirectional', 'http/2', 'connection', 'streaming'],
      defaultAnswer: 'WebSockets provide full-duplex bidirectional communication best for collaborative apps or chat. SSE is lightweight and ideal for server-to-client unidirectional streams like AI generation over HTTP/2. Long polling is a fallback when neither is supported.',
      keyConcept: 'Real-Time Communication Protocol Trade-offs',
      alexNote: 'Excellent architectural comparison between duplex and unidirectional streams.',
      emmaNote: 'Fluent articulation of network protocol capabilities.',
      sarahNote: 'Technically well-rounded across network layers.'
    },
    {
      q: 'Tell me about a challenging production outage or performance bottleneck you debugged in the past. What was your triage methodology?',
      keywords: ['outage', 'debugging', 'metrics', 'apm', 'profiling', 'root cause', 'postmortem', 'triage'],
      defaultAnswer: 'I isolate issues using APM metrics and distributed logs, roll back recent deployments if critical, reproduce in a staging sandbox with profiling tools, and publish a blameless post-mortem with preventative alerts.',
      keyConcept: 'Production Incident Triage & Blameless Post-Mortem',
      alexNote: 'Pragmatic engineering discipline during high-pressure situations.',
      emmaNote: 'High emotional intelligence, focuses on system recovery and learning.',
      sarahNote: 'Strong leadership traits and production maturity.'
    }
  ],
  'Distributed Systems & Microservices': [
    {
      q: 'How do you apply the CAP theorem and PACELC theorem when designing a globally distributed microservices architecture?',
      keywords: ['cap', 'pacelc', 'consistency', 'availability', 'partition', 'latency', 'tradeoff', 'distributed'],
      defaultAnswer: 'The CAP theorem states that under a network partition, a system must choose between consistency and availability. The PACELC theorem extends this by noting that even under normal operation, one must choose between latency and consistency.',
      keyConcept: 'PACELC Theorem & Distributed Trade-offs',
      alexNote: 'Thorough understanding of partition tolerance and replication latency.',
      emmaNote: 'Analytical and precise delivery.',
      sarahNote: 'Candidate grasps core fundamentals for large-scale enterprise services.'
    },
    {
      q: 'How do you handle distributed transactions across microservices? When do you choose the Saga pattern vs Two-Phase Commit (2PC)?',
      keywords: ['saga', '2pc', 'choreography', 'orchestration', 'transaction', 'compensating', 'distributed'],
      defaultAnswer: 'Two-Phase Commit provides strong consistency but introduces high latency and blocking coordinator vulnerabilities. I use the Saga pattern with compensating transactions, either choreographed via event brokers or orchestrated via a state machine.',
      keyConcept: 'Saga Pattern & Compensating Workflows',
      alexNote: 'Excellent breakdown of orchestration vs choreography trade-offs.',
      emmaNote: 'Very articulate, explains complex concepts without pausing.',
      sarahNote: 'Senior-level understanding of eventual consistency.'
    },
    {
      q: 'How do you design an event-driven system with Apache Kafka to guarantee exactly-once processing (EOS) semantics?',
      keywords: ['kafka', 'idempotent', 'producer', 'consumer', 'offset', 'transaction', 'partition'],
      defaultAnswer: 'Exactly-once semantics requires an idempotent producer, transactional producer APIs committing offsets and messages atomically, and idempotent consumer write sinks.',
      keyConcept: 'Kafka Exactly-Once Semantics & Idempotent Writers',
      alexNote: 'Outstanding mastery of Kafka transaction coordinators and consumer offsets.',
      emmaNote: 'Clear, authoritative delivery with no hesitation.',
      sarahNote: 'Ready for staff-level distributed systems engineering roles.'
    }
  ],
  'AI & Machine Learning Infrastructure': [
    {
      q: 'How do you design a low-latency LLM serving pipeline for production traffic, optimizing KV cache memory and time-to-first-token (TTFT)?',
      keywords: ['vllm', 'pagedattention', 'kv cache', 'speculative', 'latency', 'gpu', 'throughput', 'quantization'],
      defaultAnswer: 'I use high-throughput serving engines like vLLM with PagedAttention to eliminate memory fragmentation in the KV cache, combined with continuous batching, FP8 or AWQ quantization, and speculative decoding.',
      keyConcept: 'PagedAttention & Continuous Batching Optimization',
      alexNote: 'Deep awareness of GPU memory bandwidth constraints and PagedAttention.',
      emmaNote: 'Strong technical articulation and confident pacing.',
      sarahNote: 'Directly applicable knowledge for state-of-the-art AI product teams.'
    },
    {
      q: 'Can you compare Retrieval-Augmented Generation (RAG) architectures with fine-tuning for domain-specific enterprise knowledge?',
      keywords: ['rag', 'vector', 'embeddings', 'fine-tuning', 'hallucination', 'chunking', 'retrieval', 'hybrid'],
      defaultAnswer: 'RAG is optimal for frequently updated proprietary data and provides verifiable citations while minimizing hallucinations. Fine-tuning is best for teaching custom tone, specialized vocabularies, or rigid structured formats.',
      keyConcept: 'RAG vs Parametric Fine-Tuning Trade-offs',
      alexNote: 'Accurately articulated the complementary nature of hybrid search and adapters.',
      emmaNote: 'Warm, pragmatic approach balancing costs and engineering effort.',
      sarahNote: 'Strong alignment with cost-effective AI product delivery.'
    }
  ]
};

const generateDynamicQuestion = (track: string, index: number): QuestionItem => {
  const qNum = index + 1;
  const scenarios: QuestionItem[] = [
    {
      q: `Scenario #${qNum} for ${track}: System Resiliency: How would you architect your service to gracefully handle cascading downstream failures and transient network partitions?`,
      keywords: ['circuit breaker', 'retry', 'exponential backoff', 'jitter', 'fallback', 'bulkhead', 'timeout'],
      defaultAnswer: 'I implement circuit breakers with exponential backoff and jitter, combined with bulkhead isolation to prevent worker thread pool starvation across dependent services.',
      keyConcept: `Fault Tolerance & Circuit Breaking #${qNum}`,
      alexNote: 'Clear architectural safeguards against cascading failures.',
      emmaNote: 'High technical composure, clear system explanations.',
      sarahNote: 'Shows dependable engineering judgment in critical infrastructure.'
    },
    {
      q: `Scenario #${qNum} for ${track}: Performance Optimization: Walk me through your methodology for profiling high CPU and memory consumption in production services.`,
      keywords: ['profiling', 'heap dump', 'flamegraph', 'cpu', 'memory leak', 'gc', 'metrics'],
      defaultAnswer: 'I generate flame graphs to identify CPU hotspots, inspect heap snapshots for memory leaks across generation lifecycles, and cross-reference with distributed trace telemetry.',
      keyConcept: `Production Profiling & Flame Graph Analysis #${qNum}`,
      alexNote: 'Precise understanding of profiling tools and memory heap mechanics.',
      emmaNote: 'Methodical communication style, easy to follow.',
      sarahNote: 'Deep real-world troubleshooting experience.'
    },
    {
      q: `Scenario #${qNum} for ${track}: Behavioral Deep-Dive: Describe a scenario where you had to negotiate technical debt versus delivering new business features under strict executive deadlines.`,
      keywords: ['technical debt', 'tradeoff', 'deadline', 'priority', 'business value', 'refactor', 'compromise'],
      defaultAnswer: 'I quantified the risk of technical debt in terms of system outages and team velocity, proposing an incremental refactoring plan alongside core feature delivery to align engineering health with business objectives.',
      keyConcept: `Technical Debt Negotiation & Business Value Alignment #${qNum}`,
      alexNote: 'Pragmatic balance between code quality and business delivery velocity.',
      emmaNote: 'Empathetic stakeholder management and clear prioritization.',
      sarahNote: 'Demonstrates strong leadership potential and strategic judgment.'
    }
  ];
  return scenarios[index % scenarios.length];
};

/* -------------------------------------------------------------------------- */
/*                    MAIN LIVE INTERVIEW ROOM COMPONENT                      */
/* -------------------------------------------------------------------------- */

export default function FullLiveInterviewRoom() {
  const router = useRouter();

  // Configuration Modal States
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState('Full-Stack Engineering (React & Node.js)');
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [targetAgent, setTargetAgent] = useState<'sarah' | 'alex' | 'emma'>('alex');

  // Call Controls State
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [candidateName, setCandidateName] = useState('Candidate');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Conversation History States for Evaluation
  const [conversationHistory, setConversationHistory] = useState<Array<{ sender: string; text: string }>>([]);
  const conversationHistoryRef = useRef<Array<{ sender: string; text: string }>>([]);

  const recordDialogue = (sender: string, text: string) => {
    if (!text || text.trim().length === 0) return;
    conversationHistoryRef.current.push({ sender, text });
    setConversationHistory([...conversationHistoryRef.current]);
  };

  // Safe Session State
  const [sessionData, setSessionData] = useState<{
    startTime: number;
    sessionId: string;
  }>({
    startTime: Date.now(),
    sessionId: `INT-${Date.now()}`
  });

  // Agora State & Refs
  const [agoraClient, setAgoraClient] = useState<any>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<any>(null);
  const [channelName, setChannelName] = useState<string>('');
  const [isAgoraConnected, setIsAgoraConnected] = useState<boolean>(false);

  // AI Speaking State & Voice
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Video, Canvas & Voice Refs
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic Question & Real-Time Tracker States
  const [questionIndex, setQuestionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [isEnding, setIsEnding] = useState(false);
  const [dynamicQuestions, setDynamicQuestions] = useState<Record<number, QuestionItem>>({});

  // Sync Timer with Selected Duration
  useEffect(() => {
    setSecondsLeft(selectedDuration * 60);
  }, [selectedDuration]);

  // Compute current question dynamically with fallback
  const currentQ: QuestionItem = useMemo(() => {
    if (dynamicQuestions[questionIndex]) {
      return dynamicQuestions[questionIndex];
    }
    const trackBank = TRACK_QUESTIONS[selectedTrack] || TRACK_QUESTIONS['Full-Stack Engineering (React & Node.js)'];
    if (questionIndex < trackBank.length) {
      return trackBank[questionIndex];
    }
    return generateDynamicQuestion(selectedTrack, questionIndex);
  }, [selectedTrack, questionIndex, dynamicQuestions]);

  // Synchronized refs so speech recognition & synthesis never suffer from race conditions or closures
  const isAiSpeakingRef = useRef(false);
  useEffect(() => {
    isAiSpeakingRef.current = isAiSpeaking;
  }, [isAiSpeaking]);

  const isMicMutedRef = useRef(isMicMuted);
  useEffect(() => { isMicMutedRef.current = isMicMuted; }, [isMicMuted]);

  const isSpeakerMutedRef = useRef(isSpeakerMuted);
  useEffect(() => { isSpeakerMutedRef.current = isSpeakerMuted; }, [isSpeakerMuted]);

  const isEndingRef = useRef(false);
  const isRoomActiveRef = useRef(false);

  const selectedTrackRef = useRef(selectedTrack);
  useEffect(() => { selectedTrackRef.current = selectedTrack; }, [selectedTrack]);

  const currentQRef = useRef(currentQ);
  useEffect(() => { currentQRef.current = currentQ; }, [currentQ]);

  const liveAnswerRef = useRef('');
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // LIVE DYNAMIC METRICS STATE
  const [liveAnswer, setLiveAnswer] = useState(currentQ.defaultAnswer);
  const [liveAccuracy, setLiveAccuracy] = useState(92);
  const [liveCorrection, setLiveCorrection] = useState('Solid fundamentals. Add explicit real-world system tradeoffs for extra credit.');
  const [liveGrammar, setLiveGrammar] = useState('Clear & Technical');
  const [liveScores, setLiveScores] = useState({ comm: 88, tech: 92, conf: 90, prob: 86 });
  const [liveFiller, setLiveFiller] = useState(1);
  const [liveWpm, setLiveWpm] = useState(136);
  const [liveEmotion, setLiveEmotion] = useState('Calm & Focused');
  const [liveDecision, setLiveDecision] = useState('Active evaluation in progress. AI agents analyzing response via Agora VAD loop.');

  // Load Candidate Name
  useEffect(() => {
    if (typeof window === 'undefined') return;
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

  // Agora Real-Time Voice Session Function
  const startAgoraCall = async (targetChannel: string) => {
    let client: any = null;
    let audioTrack: any = null;

    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;

      // 1. Fetch dynamic token from backend
      const tokenRes = await fetch(`${BACKEND_URL}/api/agora/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_name: targetChannel, uid: 0 })
      });
      
      if (!tokenRes.ok) throw new Error('Failed to fetch Agora token');
      const data = await tokenRes.json();

      // 2. Create Agora client and join channel
      client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setAgoraClient(client);

      await client.join(data.app_id, targetChannel, data.token, 0);

      // 3. Create and publish local microphone audio track
      audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(audioTrack);
      await client.publish([audioTrack]);
      setIsAgoraConnected(true);

      // 4. Trigger backend to bring AI Agent into the channel and store agent_id safely
      const agentRes = await fetch(`${BACKEND_URL}/api/agora/start-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_name: targetChannel, persona: targetAgent })
      });

      if (agentRes.ok) {
        const agentData = await agentRes.json();
        const extractedAgentId = agentData.agent_id || agentData.data?.agent_id || agentData.data?.id;
        if (extractedAgentId) {
          localStorage.setItem('active_agent_id', extractedAgentId);
        }
      }

      // 5. Subscribe to incoming AI Agent audio stream automatically via VAD
      client.on('user-published', async (user: any, mediaType: string) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') {
          try {
            user.audioTrack.play();
            setIsAiSpeaking(true);
          } catch (audioErr) {
            console.warn('Playback error:', audioErr);
          }
        }
      });

      client.on('user-unpublished', (user: any, mediaType: string) => {
        if (mediaType === 'audio') {
          setIsAiSpeaking(false);
        }
      });

      client.on('connection-state-change', (curState: string) => {
        if (curState === 'DISCONNECTED') {
          setIsAgoraConnected(false);
        }
      });

    } catch (err) {
      console.warn('Agora WebRTC initialization issue:', err);
    }
  };

  // Advance to next question function (triggered automatically by silence)
  const advanceQuestion = () => {
    if (isEndingRef.current) return;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (liveAnswerRef.current) {
      recordDialogue('candidate', liveAnswerRef.current);
    }

    setQuestionIndex((prev) => {
      const nextIdx = prev + 1;

      // Notify backend asynchronously
      fetch(`${BACKEND_URL}/api/interview/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedTrackRef.current,
          previous_answer: liveAnswerRef.current,
          question_index: nextIdx
        })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.question || data.q)) {
          const newQText = data.question || data.q;
          setDynamicQuestions((curr) => ({
            ...curr,
            [nextIdx]: {
              q: newQText,
              keywords: data.keywords || ['architecture', 'performance', 'system', 'tradeoff'],
              defaultAnswer: data.suggested_answer || 'Comprehensive architectural response.',
              keyConcept: data.concept || 'Dynamic AI Follow-up',
              alexNote: data.alex_note || 'Assessing technical depth on dynamic topic.',
              emmaNote: data.emma_note || 'Evaluating clarity of explanation and tone.',
              sarahNote: data.sarah_note || 'Assessing industry best practices.'
            }
          }));
        }
      })
      .catch((err) => console.warn('Backend question sync note:', err));

      return nextIdx;
    });
  };

  // Safe Text-To-Speech with Echo Prevention & Chrome Keep-Alive Watchdog
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeakerMutedRef.current) return;

    recordDialogue('interviewer', text);

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Prevent Chrome garbage collection bug from cutting off speech
    (window as any).__activeUtterance = utterance;

    const stopSpeaking = () => {
      setIsAiSpeaking(false);
      isAiSpeakingRef.current = false;
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
      }
    };

    utterance.onstart = () => {
      setIsAiSpeaking(true);
      isAiSpeakingRef.current = true;
    };

    utterance.onend = () => {
      stopSpeaking();
    };

    utterance.onerror = () => {
      stopSpeaking();
    };

    // Watchdog: In Chrome, speech synthesis can stall; ensure isAiSpeaking is NEVER stuck!
    const wordCount = text.split(/\s+/).length;
    const maxSpeechTime = Math.max(4000, (wordCount / 2.2) * 1000 + 2000);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    safetyTimerRef.current = setTimeout(() => {
      if (isAiSpeakingRef.current) {
        console.warn('SpeechSynthesis watchdog safety reset');
        stopSpeaking();
      }
    }, maxSpeechTime);

    window.speechSynthesis.speak(utterance);
  };

  // Trigger question speech on configuration close or questionIndex advance
  useEffect(() => {
    if (isConfiguring || isEnding) return;

    // Reset live captured speech display for each new question
    setLiveAnswer('');
    liveAnswerRef.current = '';

    const timer = setTimeout(() => {
      speakText(currentQ.q);
    }, 500);

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isConfiguring, questionIndex, isEnding]);

  // LIVE SPEECH RECOGNITION (PERSISTENT & BULLETPROOF WITH BARGE-IN)
  useEffect(() => {
    if (isConfiguring || typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    isRoomActiveRef.current = true;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      if (isEndingRef.current) return;

      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        interimTranscript += event.results[i][0].transcript;
      }

      const trimmed = interimTranscript.trim();
      if (!trimmed) return;

      // BARGE-IN: If candidate begins speaking, immediately stop AI TTS so candidate answer is cleanly captured
      if (isAiSpeakingRef.current) {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setIsAiSpeaking(false);
        isAiSpeakingRef.current = false;
      }

      const spokenText = trimmed;
      setLiveAnswer(spokenText);
      liveAnswerRef.current = spokenText;

      const q = currentQRef.current;
      const lower = spokenText.toLowerCase();
      const matched = q.keywords.filter((kw) => lower.includes(kw));
      const matchRatio = Math.min(100, Math.max(65, Math.round(65 + (matched.length / Math.max(1, q.keywords.length)) * 35)));
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

      if (matched.length >= 2) {
        setLiveCorrection(`Strong coverage of core concepts (${matched.join(', ')}). Advancing question difficulty.`);
        setLiveGrammar('Sharp & Structured');
        setLiveDecision('AI Agents approve response depth. Advancing to next evaluation topic.');
      } else {
        setLiveCorrection(`Try mentioning relevant terms like: ${q.keywords.slice(0, 3).join(', ')}.`);
        setLiveGrammar('Developing Argument');
        setLiveDecision('Evaluating answer depth... Sarah recommending follow-up clarification.');
      }

      // SILENCE DETECTION: 1.8 second silence triggers automatic next question advance
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        advanceQuestion();
      }, 1800);
    };

    // Auto-restart if Chrome naturally pauses recognition due to silence
    recognition.onend = () => {
      if (isRoomActiveRef.current && !isEndingRef.current && !isMicMutedRef.current) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognition.onerror = (e: any) => {
      console.log('Speech Recognition:', e.error);
      if (e.error !== 'aborted' && isRoomActiveRef.current && !isEndingRef.current && !isMicMutedRef.current) {
        setTimeout(() => {
          try { recognition.start(); } catch (err) {}
        }, 300);
      }
    };

    try {
      recognition.start();
    } catch (err) {}

    recognitionRef.current = recognition;

    return () => {
      isRoomActiveRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      try {
        recognition.stop();
      } catch (err) {}
    };
  }, [isConfiguring]);

  // Real Webcam initialization
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

  // Audio Canvas Visualizer
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

        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.moveTo(0, height / 2);
        for (let i = 0; i < width; i++) {
          const wave = Math.cos(i * 0.04 + step * 0.08) * 6;
          ctx.lineTo(i, height / 2 + wave);
        }
        ctx.stroke();
      }

      step++;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isConfiguring, isMicMuted]);

  // Countdown Session Timer
  useEffect(() => {
    if (isConfiguring || isEnding) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isConfiguring, isEnding]);

  // Automatic conclusion when the selected interview duration finishes
  useEffect(() => {
    if (isConfiguring || isEnding) return;
    if (secondsLeft === 0) {
      setIsEnding(true);
      const wrapUpText = `Thank you ${candidateName}! Your scheduled interview duration of ${selectedDuration} minutes has completed. You answered ${questionIndex + 1} questions. Compiling your final evaluation report now.`;
      speakText(wrapUpText);
      const autoEndTimeout = setTimeout(() => {
        handleEndCall();
      }, 6500);
      return () => clearTimeout(autoEndTimeout);
    }
  }, [secondsLeft, isConfiguring, isEnding, candidateName, selectedDuration, questionIndex]);

  const formatTimer = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Handle End Call & Cleanup Agora session with backend AI Evaluation
  const handleEndCall = async () => {
    setIsEnding(true);
    isEndingRef.current = true;
    isRoomActiveRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      if (agoraClient) {
        await agoraClient.leave();
      }
    } catch (err) {
      console.warn('Error disconnecting Agora client:', err);
    }
    
    const agentId = localStorage.getItem('active_agent_id');
    if (agentId) {
      try {
        await fetch(`${BACKEND_URL}/api/agora/stop-agent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agent_id: agentId })
        });
        localStorage.removeItem('active_agent_id');
      } catch (e) {
        console.error('Error stopping agent:', e);
      }
    }

    // REAL HUMAN-LIKE AI EVALUATION VIA BACKEND
    try {
      const evalRes = await fetch(`${BACKEND_URL}/api/interview/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedTrackRef.current,
          difficulty: 'Senior',
          persona: targetAgent,
          conversation: conversationHistoryRef.current.length > 0
            ? conversationHistoryRef.current
            : [
                { sender: 'interviewer', text: currentQRef.current.q },
                { sender: 'candidate', text: liveAnswerRef.current || currentQRef.current.defaultAnswer }
              ]
        })
      });

      if (evalRes.ok) {
        const evalData = await evalRes.json();
        if (evalData.report) {
          localStorage.setItem('interview_results', JSON.stringify(evalData.report));
        }
      }
    } catch (err) {
      console.warn('AI evaluation fallback:', err);
      const overall = Math.round((liveScores.tech * 0.35) + (liveScores.comm * 0.3) + (liveScores.conf * 0.2) + (liveScores.prob * 0.15));
      const resultsData = {
        overall_score: overall,
        technical_accuracy: liveScores.tech,
        communication_clarity: liveScores.comm,
        depth_of_knowledge: liveScores.prob,
        strengths: [
          `Strong conceptual knowledge demonstrated in ${selectedTrack.split(' ')[0]}`,
          `Maintained steady conversational pacing of ~${liveWpm} WPM with confident articulation`,
          `Successfully completed ${questionIndex + 1} in-depth technical questions across the session`
        ],
        areas_for_improvement: [
          'Incorporate more quantifiable production performance metrics into architectural tradeoffs',
          'Explore distributed failure modes, circuit breaking, and automated fallback patterns in deeper depth'
        ],
        summary_feedback: `The candidate completed ${questionIndex + 1} questions during the ${selectedDuration}-minute evaluation for ${selectedTrack}. Demonstrated solid domain knowledge, technical fluency, and structured reasoning across all AI agent reviews.`
      };
      localStorage.setItem('interview_results', JSON.stringify(resultsData));
    }

    router.push('/results');
  };

  return (
    <div className="h-screen w-screen bg-[#040711] text-slate-200 font-sans flex flex-col overflow-hidden select-none">
      
      {/* PRE-INTERVIEW CONFIGURATION MODAL */}
      {isConfiguring && (
        <div className="absolute inset-0 z-50 bg-[#040711]/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
                <Sliders size={13} /> Session Configuration
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white uppercase">
                Configure Your Live AI Interview
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Customize your technical track, interview duration, and AI interviewer persona.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">Engineering Track</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.keys(TRACK_QUESTIONS).map((track) => (
                    <button
                      key={track}
                      onClick={() => setSelectedTrack(track)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                        selectedTrack === track
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{track}</span>
                      {selectedTrack === track && <CheckCircle2 size={15} className="text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">Interview Duration</label>
                <div className="grid grid-cols-3 gap-3">
                  {[10, 15, 30].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setSelectedDuration(mins)}
                      className={`py-2.5 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center gap-2 ${
                        selectedDuration === mins
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-indigo-400 text-white shadow-lg'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Clock size={14} /> {mins} Minutes
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">Lead AI Interviewer</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['sarah', 'alex', 'emma'] as const).map((agentKey) => {
                    const agent = agentKey === 'sarah' ? { name: 'Sarah', role: 'Hiring Lead' } : agentKey === 'alex' ? { name: 'Alex', role: 'Technical Lead' } : { name: 'Emma', role: 'Behavioral Lead' };
                    const isSelected = targetAgent === agentKey;
                    return (
                      <button
                        key={agentKey}
                        onClick={() => setTargetAgent(agentKey)}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-bold">{agent.name}</span>
                        <span className="text-[10px] text-slate-400">{agent.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const generatedChannel = `jynex-room-${Date.now()}`;
                setChannelName(generatedChannel);
                setSessionData({
                  startTime: Date.now(),
                  sessionId: `INT-${Date.now()}`
                });
                setIsConfiguring(false);
                startAgoraCall(generatedChannel);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition active:scale-[0.99]"
            >
              <Play size={16} fill="white" /> Launch Live Interview Room
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="h-14 border-b border-slate-800/80 bg-[#060a17]/95 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-cyan-500/20">
              <Sparkles size={16} />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white uppercase">
              JYNEX <span className="text-cyan-400">AGENT</span>
            </span>
          </Link>

          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">{selectedTrack}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              Q#{questionIndex + 1}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl font-mono text-xs">
            <Clock size={13} className="text-cyan-400" />
            <span className="text-cyan-300 font-bold">{formatTimer(secondsLeft)}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div className="flex items-center gap-1 h-3">
              <div className={`w-1 bg-cyan-400 rounded-full ${isAiSpeaking ? 'h-3 animate-pulse' : 'h-1.5'}`} />
              <div className={`w-1 bg-purple-400 rounded-full ${isAiSpeaking ? 'h-4 animate-pulse' : 'h-2'}`} />
              <div className={`w-1 bg-blue-400 rounded-full ${isAiSpeaking ? 'h-5 animate-pulse' : 'h-1.5'}`} />
            </div>
          </div>

          <button
            onClick={handleEndCall}
            className="bg-rose-600/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 px-4 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-rose-600/10"
          >
            <PhoneOff size={14} /> End Interview
          </button>
        </div>
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

        {/* CENTER COLUMN: TILES + TRACKER + COLLABORATION */}
        <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-gradient-to-b from-[#060a16] via-[#050812] to-[#03050c]">
          
          {/* VIDEO CALL STREAM TILES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64 shrink-0">
            
            {/* AI Speaking Avatar Tile with Full-Frame Realistic Video & Lip-Sync */}
            <LiveAiAvatar
              persona={targetAgent}
              isSpeaking={isAiSpeaking}
              isCandidateSpeaking={!isAiSpeaking && liveAnswer.trim().length > 0}
            />

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
                    <span className="text-[10px] text-slate-500">Camera stream muted</span>
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
                  {isMicMuted ? 'Mic Muted' : 'Live Voice Stream Active'}
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
              onClick={() => setIsVideoOff(!isVideoOff)}
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
              onClick={handleEndCall}
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
                  Question #{questionIndex + 1}: Live Correction & Concept Tracker
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                Model: Jynex Evaluator v2.4 (Agora VAD Active)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <MessageSquare size={12} className="text-blue-400" /> Live Captured Speech
                  </span>
                </div>
                <p className="text-slate-200 text-[11px] leading-relaxed italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 max-h-16 overflow-y-auto">
                  "{liveAnswer || (isAiSpeaking ? `AI is asking Question #${questionIndex + 1}...` : 'Listening for your response...')}"
                </p>
              </div>

              <div className="bg-slate-900/50 border border-amber-500/20 p-3 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <AlertTriangle size={12} /> AI Live Correction / Recommendation
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {liveCorrection}
                </p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                    <TrendingUp size={12} className="text-emerald-400" /> Accuracy & Fluency
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-black text-emerald-400">{liveAccuracy}%</span>
                    <span className="text-[10px] text-slate-400">{liveGrammar}</span>
                  </div>
                </div>
                <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                  Concept: <span className="text-white font-medium">{currentQ.keyConcept}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AGENT COLLABORATION DECISION WORKFLOW */}
          <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Zap size={14} className="text-purple-400" />
                <span>Agent Collaboration System (Continuous VAD Flow)</span>
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
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{currentQ.alexNote}</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-purple-500/30 p-3 rounded-xl flex items-start gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <UserCheck size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Behavioural AI (Emma)</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{currentQ.emmaNote}</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-amber-500/30 p-3 rounded-xl flex items-start gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Briefcase size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Hiring Manager AI (Sarah)</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{currentQ.sarahNote}</p>
                </div>
              </div>
            </div>

            {/* Dynamic AI Decision Box */}
            <div className="bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-blue-950/40 border border-cyan-500/30 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wide">
                <Zap size={14} className="animate-pulse text-cyan-400" />
                <span>AI Collaboration Decision</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-medium">{liveDecision}</p>
            </div>
          </div>

        </main>

        {/* RIGHT SIDEBAR: REAL-TIME DYNAMIC METRICS */}
        <aside className="w-80 border-l border-slate-800/80 bg-[#060914] p-4 flex flex-col justify-between shrink-0 overflow-y-auto hidden xl:flex space-y-4">
          
          {/* LIVE ANALYSIS DYNAMIC METRICS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" /> Live Dynamic Analysis
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Speech Velocity (WPM)</span>
                <span className="font-mono text-cyan-400 font-bold">{liveWpm} WPM</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (liveWpm / 180) * 100)}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Filler Words</span>
                <span className="font-mono text-amber-400 font-bold">{liveFiller} detected</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, liveFiller * 20)}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Technical Accuracy</span>
                <span className="font-mono text-emerald-400 font-bold">{liveScores.tech}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full transition-all duration-300" style={{ width: `${liveScores.tech}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Communication Clarity</span>
                <span className="font-mono text-blue-400 font-bold">{liveScores.comm}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full transition-all duration-300" style={{ width: `${liveScores.comm}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Confidence Level</span>
                <span className="font-mono text-purple-400 font-bold">{liveScores.conf}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full transition-all duration-300" style={{ width: `${liveScores.conf}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Problem Solving Depth</span>
                <span className="font-mono text-indigo-400 font-bold">{liveScores.prob}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400 rounded-full transition-all duration-300" style={{ width: `${liveScores.prob}%` }} />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Smile size={12} className="text-cyan-400" /> Sentiment / Tone
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                  {liveEmotion}
                </span>
              </div>
            </div>
          </div>

          {/* DYNAMIC AUDIO WAVEFORM VISUALIZER */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Activity size={12} className="text-cyan-400" /> Audio Waveform Spectrum
              </span>
              <span className="text-[10px] font-mono text-cyan-400">LIVE</span>
            </div>
            <canvas
              ref={canvasRef}
              width={260}
              height={40}
              className="w-full h-10 rounded-lg bg-slate-900/60"
            />
          </div>

          {/* DYNAMIC REAL-TIME CHAT STREAM */}
          <div className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare size={12} className="text-blue-400" /> Dialogue Stream
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {conversationHistory.length} turns
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              <div className="bg-blue-950/30 border border-blue-800/40 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-blue-400 block">AI Interviewer (Question #{questionIndex + 1})</span>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{currentQ.q}</p>
              </div>

              {liveAnswer && (
                <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-400 block">{candidateName} (Speaking)</span>
                  <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed italic">"{liveAnswer}"</p>
                </div>
              )}
            </div>
          </div>

        </aside>

      </div>

    </div>
  );
}
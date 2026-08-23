'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mic, MicOff, PhoneOff, Loader2, Sparkles, Volume2, VolumeX, Send, CheckCircle2 } from 'lucide-react';
import { interviewApi, DialoguePayload } from '@/lib/api';

interface LocalMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

const MAX_QUESTIONS = 5;

function AudioWaveVisualizer({ isActive, colorClass }: { isActive: boolean; colorClass: string }) {
  const delays = ['0ms', '150ms', '300ms', '100ms', '250ms', '350ms', '200ms'];

  return (
    <div className="flex items-center justify-center gap-1.5 h-10">
      {delays.map((delay, i) => (
        <span
          key={i}
          style={{
            animationDelay: delay,
            animationDuration: '0.8s',
          }}
          className={`w-1.5 rounded-full transition-all duration-300 ${
            isActive ? `h-6 animate-pulse ${colorClass}` : 'h-1.5 bg-slate-700'
          }`}
        />
      ))}
    </div>
  );
}

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'Full Stack Developer';
  const difficulty = searchParams.get('difficulty') || 'Medium';

  const [questionCount, setQuestionCount] = useState<number>(1);
  const [messages, setMessages] = useState<LocalMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Welcome to your ${role} interview (${difficulty} level). Please introduce yourself and discuss your most significant technical project.`
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finalSpokenTextRef = useRef<string>('');

  // Robust Native TTS Engine
  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const triggerAudioPlayback = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Pehle se pending speech ko clean karein
    window.speechSynthesis.cancel();
    stopSpeechListening();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsListening(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      // AI bol chuka, ab mic open karein
      startSpeechListening();
    };

    utterance.onerror = (e) => {
      console.warn('TTS error:', e);
      setIsSpeaking(false);
      startSpeechListening();
    };

    // Small delay to ensure synthesis ready state
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 150);
  };

  // Evaluation & Results
  const handleFinalEvaluation = async (allMessages: LocalMessage[]) => {
    setIsEvaluating(true);
    stopAudio();
    stopSpeechListening();

    const conversationHistory: DialoguePayload[] = allMessages.map((m) => ({
      sender: m.sender === 'user' ? 'candidate' : 'ai',
      text: m.text,
    }));

    try {
      const evalData = await interviewApi.evaluateInterview({
        role,
        difficulty,
        conversation: conversationHistory,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('interview_results', JSON.stringify(evalData.report));
      }
      router.push('/results');
    } catch (err) {
      router.push('/results');
    } finally {
      setIsEvaluating(false);
    }
  };

  // User Answer Handler
  const handleUserAnswer = async (spokenText: string) => {
    if (!spokenText.trim() || isLoading || isEvaluating) return;

    stopAudio();
    stopSpeechListening();

    const userMsg: LocalMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: spokenText.trim()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);
    setTextInput('');
    setLiveTranscript('');

    if (questionCount >= MAX_QUESTIONS) {
      await handleFinalEvaluation(updatedMessages);
      return;
    }

    try {
      const historyPayload: DialoguePayload[] = updatedMessages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const data = await interviewApi.getFollowUpQuestion(spokenText, historyPayload);
      const aiReply = data.next_question || data.question || data.response || 'Can you elaborate on your project trade-offs?';

      setQuestionCount((prev) => prev + 1);

      const aiMsg: LocalMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReply
      };

      setMessages((prev) => [...prev, aiMsg]);
      
      // Next question bolna shuru karein
      triggerAudioPlayback(aiReply);
    } catch (err) {
      const fallbackMsg = 'How do you approach debugging and monitoring in production environments?';
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: fallbackMsg }]);
      triggerAudioPlayback(fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Speech Recognition with Silence Timeout
  const startSpeechListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    stopSpeechListening();

    finalSpokenTextRef.current = '';
    setLiveTranscript('');

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let accumulated = finalSpokenTextRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          accumulated += (accumulated ? ' ' : '') + item[0].transcript.trim();
        } else {
          interim += item[0].transcript;
        }
      }

      finalSpokenTextRef.current = accumulated;
      const totalText = (accumulated + ' ' + interim).trim();
      setLiveTranscript(totalText);

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      if (totalText.length > 0) {
        silenceTimerRef.current = setTimeout(() => {
          stopSpeechListening();
          handleUserAnswer(totalText);
        }, 2200);
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {};

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {}
  };

  const stopSpeechListening = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      const textToSubmit = (finalSpokenTextRef.current + ' ' + liveTranscript).trim();
      stopSpeechListening();
      if (textToSubmit) {
        handleUserAnswer(textToSubmit);
      }
    } else {
      stopAudio();
      startSpeechListening();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length === 1 && messages[0].sender === 'ai') {
        triggerAudioPlayback(messages[0].text);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      stopAudio();
      stopSpeechListening();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleUserAnswer(textInput);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Header */}
      <header className="max-w-5xl w-full mx-auto flex justify-between items-center bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 px-6 py-3.5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-wide text-white flex items-center gap-2">
              {role} Interview
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Difficulty: {difficulty}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full text-xs font-medium text-blue-400">
            <CheckCircle2 size={14} /> Round {questionCount} of {MAX_QUESTIONS}
          </div>

          {isSpeaking && (
            <button
              onClick={stopAudio}
              className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-full text-xs font-medium animate-pulse"
            >
              <VolumeX size={14} /> Stop Voice
            </button>
          )}

          <button 
            onClick={() => handleFinalEvaluation(messages)}
            className="flex items-center gap-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 px-4 py-1.5 rounded-xl text-xs font-semibold transition"
          >
            <PhoneOff size={14} /> End Session
          </button>
        </div>
      </header>

      {/* Main Orb & Waveform */}
      <main className="max-w-4xl w-full mx-auto my-auto flex flex-col items-center py-4">
        <div className="relative mb-3 flex flex-col items-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
            isEvaluating
              ? 'border-2 border-amber-400 bg-amber-500/10 shadow-[0_0_35px_rgba(251,191,36,0.45)]'
              : isLoading 
              ? 'border-2 border-purple-500 bg-purple-500/10 shadow-[0_0_35px_rgba(168,85,247,0.45)]'
              : isSpeaking
              ? 'border-2 border-emerald-400 bg-emerald-500/15 shadow-[0_0_40px_rgba(52,211,153,0.5)] scale-110'
              : isListening 
              ? 'border-2 border-amber-400 bg-amber-500/15 shadow-[0_0_40px_rgba(251,191,36,0.4)] scale-110' 
              : 'border-2 border-blue-500/60 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
          }`}>
            {isEvaluating ? (
              <Loader2 className="animate-spin text-amber-400" size={28} />
            ) : isLoading ? (
              <Loader2 className="animate-spin text-purple-400" size={28} />
            ) : isSpeaking ? (
              <Volume2 className="text-emerald-400 animate-pulse" size={28} />
            ) : isListening ? (
              <Mic className="text-amber-400 animate-bounce" size={28} />
            ) : (
              <Volume2 className="text-blue-400" size={28} />
            )}
          </div>

          <div className="mt-2">
            <AudioWaveVisualizer 
              isActive={isSpeaking || isListening} 
              colorClass={isSpeaking ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'} 
            />
          </div>

          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {isEvaluating 
              ? 'Evaluating Complete Session...' 
              : isLoading 
              ? 'AI Generating Follow-up...' 
              : isSpeaking 
              ? 'AI Speaking Question...' 
              : isListening 
              ? 'Listening to your Voice...' 
              : 'AI Ready'}
          </span>
        </div>

        {/* Conversation Transcript */}
        <div className="w-full bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 overflow-y-auto space-y-4 h-[320px] shadow-2xl">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed border ${
                m.sender === 'user' 
                  ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none shadow-md shadow-blue-600/20' 
                  : 'bg-slate-800/80 border-slate-700/70 text-slate-200 rounded-tl-none shadow-md'
              }`}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">
                  {m.sender === 'user' ? 'Candidate (You)' : 'AI Interviewer'}
                </div>
                <p>{m.text}</p>
              </div>
            </div>
          ))}

          {/* Live Continuous Transcript */}
          {isListening && liveTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed border bg-blue-950/40 border-blue-500/30 text-blue-200 rounded-tr-none">
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-blue-400 animate-pulse">
                  Listening (Continuous)...
                </div>
                <p>{liveTranscript}</p>
              </div>
            </div>
          )}

          {(isLoading || isEvaluating) && (
            <div className="flex justify-start">
              <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-400">
                <Loader2 size={14} className="animate-spin text-blue-400" />
                {isEvaluating ? 'Compiling evaluation report with Groq LLM...' : 'Analyzing answer & generating follow-up...'}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Controls */}
      <footer className="max-w-3xl w-full mx-auto pb-2">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading || isEvaluating}
            className={`p-3.5 rounded-2xl font-bold transition shadow-lg shrink-0 ${
              isListening 
                ? 'bg-amber-500 text-black ring-4 ring-amber-500/20 shadow-amber-500/30' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={isEvaluating ? 'Evaluating session...' : isListening ? 'Listening to microphone...' : 'Type your answer or speak using the mic...'}
            disabled={isLoading || isEvaluating}
            className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />

          <button
            type="submit"
            disabled={isLoading || isEvaluating || !textInput.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white p-3.5 rounded-2xl font-semibold transition shrink-0 shadow-lg shadow-blue-600/20"
          >
            <Send size={18} />
          </button>
        </form>
      </footer>
    </div>
  );
}

export default function InterviewRoom() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090D16] text-white flex items-center justify-center">Loading Room...</div>}>
      <InterviewContent />
    </Suspense>
  );
}
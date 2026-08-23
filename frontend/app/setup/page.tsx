'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Code, 
  Briefcase, 
  Package, 
  BrainCircuit, 
  UserCheck, 
  ArrowLeft, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { Role, Difficulty, Duration } from '@/types';

export default function SetupPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>('Technical');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [duration, setDuration] = useState<Duration>('30 min');

  const roles = [
    { id: 'Technical', title: 'Technical', sub: 'Interviewer', icon: <Code size={24} /> },
    { id: 'Hiring Manager', title: 'Hiring', sub: 'Manager', icon: <Briefcase size={24} /> },
    { id: 'Product Manager', title: 'Product', sub: 'Manager', icon: <Package size={24} /> },
    { id: 'Behavioural', title: 'Behavioural', sub: 'Interviewer', icon: <BrainCircuit size={24} /> },
    { id: 'Customer', title: 'Customer', sub: 'Interviewer', icon: <UserCheck size={24} /> },
  ];

  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];
  const durations: Duration[] = ['15 min', '30 min', '45 min'];

  const handleStart = () => {
    router.push(`/interview?role=${encodeURIComponent(role)}&difficulty=${difficulty}&duration=${encodeURIComponent(duration)}`);
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col items-center justify-center p-6 font-sans selection:bg-blue-600 selection:text-white">
      
      <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 sm:p-10 rounded-3xl shadow-2xl">
        
        {/* Back Link */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <h1 className="text-2xl font-bold text-center text-white mb-8">
          Choose Your Interview
        </h1>

        {/* 1. Roles Grid (3 top, 2 bottom) */}
        <div className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {roles.slice(0, 3).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRole(item.id as Role)}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition text-center ${
                  role === item.id 
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className={role === item.id ? 'text-blue-400' : 'text-slate-500'}>
                  {item.icon}
                </div>
                <div className="text-xs font-semibold">
                  <div>{item.title}</div>
                  <div className="text-[10px] text-slate-500">{item.sub}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {roles.slice(3, 5).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRole(item.id as Role)}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition text-center ${
                  role === item.id 
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className={role === item.id ? 'text-blue-400' : 'text-slate-500'}>
                  {item.icon}
                </div>
                <div className="text-xs font-semibold">
                  <div>{item.title}</div>
                  <div className="text-[10px] text-slate-500">{item.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Difficulty Level Radio/Pills */}
        <div className="mb-8 text-center">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Difficulty Level
          </label>
          <div className="inline-flex items-center gap-6">
            {difficulties.map((d) => (
              <label 
                key={d} 
                onClick={() => setDifficulty(d)}
                className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300 hover:text-white transition"
              >
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  difficulty === d ? 'border-blue-500' : 'border-slate-700'
                }`}>
                  {difficulty === d && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                </span>
                {d}
              </label>
            ))}
          </div>
        </div>

        {/* 3. Interview Duration Selector */}
        <div className="mb-8 text-center">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Interview Duration
          </label>
          <div className="inline-flex bg-slate-950 border border-slate-800 p-1.5 rounded-2xl gap-2">
            {durations.map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => setDuration(dur)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  duration === dur 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {dur}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Start Action Button */}
        <button
          onClick={handleStart}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl font-bold text-sm transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
        >
          Start Interview <ArrowRight size={16} />
        </button>

      </div>
    </div>
  );
}
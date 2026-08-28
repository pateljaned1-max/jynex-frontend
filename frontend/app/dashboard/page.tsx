'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Mic, 
  BarChart3, 
  User, 
  Settings, 
  ArrowRight, 
  Sparkles, 
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const savedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.name) {
          setUserName(parsed.name);
        }
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  const recentInterviews = [
    { id: 1, role: 'Technical', score: '87%', date: 'Yesterday', difficulty: 'Medium' },
    { id: 2, role: 'Behavioural', score: '82%', date: '3 days ago', difficulty: 'Easy' },
    { id: 3, role: 'Product', score: '90%', date: '1 week ago', difficulty: 'Hard' },
  ];

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center gap-2.5 font-bold tracking-tight text-white mb-8">
            <span className="h-3.5 w-3.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6]"></span>
            <div className="leading-none">
              <span className="block text-sm">AI</span>
              <span className="text-xs text-slate-400 font-normal">Interviewer</span>
            </div>
          </div>

          <nav className="space-y-1.5 text-sm">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 font-medium"
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link 
              href="/setup" 
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition font-medium"
            >
              <Mic size={18} /> Interviews
            </Link>
            <Link 
              href="/results" 
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition font-medium"
            >
              <BarChart3 size={18} /> Results
            </Link>
            <Link 
              href="/profile" 
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition font-medium"
            >
              <User size={18} /> Profile
            </Link>
          </nav>
        </div>

        <Link 
          href="/profile" 
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition font-medium text-sm"
        >
          <Settings size={18} /> Settings
        </Link>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl overflow-y-auto">
        
        {/* Header Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Good evening, {userName} 👋
          </h1>
          <p className="text-slate-400 text-sm">
            Ready for your next interview?
          </p>
        </div>

        {/* Start New Interview Action Banner */}
        <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/50 border border-blue-500/30 rounded-3xl p-6 md:p-8 mb-10 relative overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles size={13} /> Voice AI Simulation
              </div>
              <h2 className="text-xl font-bold text-white mb-2">🎤 Start New Interview</h2>
              <p className="text-slate-400 text-xs md:text-sm max-w-md">
                Practice adaptive mock rounds tailored for Technical, HR, PM, and Behavioral roles.
              </p>
            </div>

            <button
              onClick={() => router.push('/setup')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm w-fit"
            >
              Start Interview <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Your Progress Stats */}
        <div className="mb-10">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Your Progress</h3>
          <div className="grid grid-cols-3 gap-4">
            
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-1">12</div>
              <div className="text-xs text-slate-400 font-medium">Interviews</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-1">87%</div>
              <div className="text-xs text-slate-400 font-medium">Average</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-purple-400 mb-1">8.5</div>
              <div className="text-xs text-slate-400 font-medium">Rating</div>
            </div>

          </div>
        </div>

        {/* Recent Interviews List */}
        <div>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Recent Interviews</h3>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl divide-y divide-slate-800/70 overflow-hidden">
            {recentInterviews.map((item) => (
              <div 
                key={item.id}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-800/40 transition"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white mb-0.5">{item.role}</h4>
                  <span className="text-xs text-slate-500">{item.difficulty} • {item.date}</span>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-sm font-bold text-emerald-400">{item.score}</span>
                  <button 
                    onClick={() => router.push('/results')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    View <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Shield, 
  Target, 
  Award, 
  Clock, 
  LogOut,
  Sparkles
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 p-6 sm:p-10 font-sans selection:bg-blue-600 selection:text-white">
      <div className="max-w-3xl mx-auto">
        
        {/* Back Link */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        {/* Profile Card Header */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 mb-8 shadow-2xl flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-blue-600/20">
            R
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles size={12} /> Candidate Pro
            </div>
            <h1 className="text-2xl font-bold text-white">Rahul Patel</h1>
            <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              <Mail size={13} /> rahul.patel@example.com
            </p>
          </div>
        </div>

        {/* Candidate Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl text-center">
            <Award className="mx-auto text-blue-400 mb-2" size={20} />
            <div className="text-xl font-bold text-white">12</div>
            <div className="text-[11px] text-slate-400">Total Rounds</div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl text-center">
            <Target className="mx-auto text-emerald-400 mb-2" size={20} />
            <div className="text-xl font-bold text-white">87%</div>
            <div className="text-[11px] text-slate-400">Avg Success</div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl text-center">
            <Clock className="mx-auto text-purple-400 mb-2" size={20} />
            <div className="text-xl font-bold text-white">4.8 hrs</div>
            <div className="text-[11px] text-slate-400">Practice Time</div>
          </div>
        </div>

        {/* Target Preferences */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Target Preferences
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl">
              <span className="text-[11px] text-slate-500 block mb-1">Target Role</span>
              <span className="text-sm font-semibold text-white">Full-Stack / Technical</span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl">
              <span className="text-[11px] text-slate-500 block mb-1">Target Difficulty</span>
              <span className="text-sm font-semibold text-white">Medium & Hard</span>
            </div>
          </div>
        </div>

        {/* Logout Action */}
        <button
          onClick={() => router.push('/login')}
          className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 py-3.5 rounded-2xl font-semibold text-xs transition flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Sign Out
        </button>

      </div>
    </div>
  );
}
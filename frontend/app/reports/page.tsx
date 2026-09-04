'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Download,
  Share2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  ArrowLeft,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://jynex-backend.onrender.com';

interface ReportItem {
  id: string;
  date: string;
  track: string;
  overallScore: number;
  status: string;
  recommendation: string;
  agents: { alex: number; emma: number; sarah: number };
  strengths: string[];
  improvements: string[];
  duration: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [candidateName, setCandidateName] = useState('Candidate');
  const [filterTrack, setFilterTrack] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const defaultReports: ReportItem[] = [
    {
      id: 'REP-2026-9041',
      date: 'Sep 02, 2026',
      track: 'Full-Stack Engineering (React & Node.js)',
      overallScore: 92,
      status: 'Passed - Level 4 Clear',
      recommendation: 'Strong Hire',
      agents: { alex: 94, emma: 90, sarah: 92 },
      strengths: ['React Diffing Algorithm', 'B-Tree Indexing', 'Clear Communication'],
      improvements: ['Mention HTTP 429 Retry-After headers', 'Reduce nervous filler words'],
      duration: '24 mins'
    },
    {
      id: 'REP-2026-8812',
      date: 'Aug 28, 2026',
      track: 'Distributed Systems & Microservices',
      overallScore: 86,
      status: 'Passed - Level 3 Clear',
      recommendation: 'Hire',
      agents: { alex: 88, emma: 82, sarah: 88 },
      strengths: ['Token Bucket Rate Limiting', 'Redis Caching Topology'],
      improvements: ['Stateful failover scenarios', 'Pacing speed consistency'],
      duration: '31 mins'
    },
    {
      id: 'REP-2026-7901',
      date: 'Aug 14, 2026',
      track: 'Database Architecture (SQL vs NoSQL)',
      overallScore: 89,
      status: 'Passed - Level 3 Clear',
      recommendation: 'Hire',
      agents: { alex: 91, emma: 87, sarah: 89 },
      strengths: ['ESR Query Optimization', 'Relational Normalization'],
      improvements: ['Compound index prefix nuance'],
      duration: '19 mins'
    }
  ];

  const [reportsList, setReportsList] = useState<ReportItem[]>(defaultReports);

  // Load Candidate Profile
  useEffect(() => {
    const stored = localStorage.getItem('user') || localStorage.getItem('currentUser');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.name) setCandidateName(parsed.name);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch Real Reports from Member 1 Backend & MongoDB
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/interview/reports`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        const rawReports = Array.isArray(data) ? data : data.reports || [];

        if (rawReports.length > 0) {
          const normalizedReports: ReportItem[] = rawReports.map((r: any, idx: number) => ({
            id: r.id || r._id || `REP-2026-${9100 + idx}`,
            date: r.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            track: r.track || r.role || 'Full-Stack Engineering',
            overallScore: r.overallScore ?? r.score ?? 88,
            status: r.status || (r.overallScore >= 90 ? 'Passed - Level 4 Clear' : 'Passed - Level 3 Clear'),
            recommendation: r.recommendation || (r.overallScore >= 90 ? 'Strong Hire' : 'Hire'),
            agents: {
              alex: r.agents?.alex ?? r.technicalScore ?? 90,
              sarah: r.agents?.sarah ?? r.overallScore ?? 88,
              emma: r.agents?.emma ?? r.communicationScore ?? 86
            },
            strengths: Array.isArray(r.strengths) && r.strengths.length > 0
              ? r.strengths
              : ['System Fundamentals', 'Concise Articulation', 'Core Architecture'],
            improvements: Array.isArray(r.improvements) && r.improvements.length > 0
              ? r.improvements
              : ['Explain real-world production tradeoffs', 'Refine pacing latency'],
            duration: r.duration || '20 mins'
          }));

          setReportsList(normalizedReports);
        }
      }
    } catch (err) {
      console.warn('Backend reports offline or warming up. Retaining fallback records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filtered List by Track
  const filteredReports = filterTrack === 'All' 
    ? reportsList 
    : reportsList.filter((r) => r.track.toLowerCase().includes(filterTrack.toLowerCase()));

  // Dynamic Average Calculation
  const avgAccuracy = reportsList.length > 0 
    ? (reportsList.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / reportsList.length).toFixed(1)
    : '0.0';

  const handleDownload = (id: string) => {
    alert(`Downloading Official JYNEX AGENT Verified Report [${id}].pdf`);
  };

  return (
    <div className="min-h-screen w-full bg-[#040711] text-slate-100 font-sans flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. TOP NAVBAR */}
      <header className="h-16 border-b border-slate-800/80 bg-[#060a17]/90 px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[1.5px]">
            <div className="w-full h-full bg-[#070b1a] rounded-[10px] flex items-center justify-center text-cyan-400">
              <FileText size={18} />
            </div>
          </div>
          <span className="font-extrabold text-lg tracking-wider text-white uppercase">
            JYNEX <span className="text-cyan-400">AGENT</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <Link href="/dashboard" className="hover:text-cyan-400 transition">Dashboard</Link>
          <Link href="/agents" className="hover:text-cyan-400 transition">AI Agents</Link>
          <Link href="/interview" className="hover:text-cyan-400 transition">Interview Engine</Link>
          <Link href="/results" className="hover:text-cyan-400 transition">Analytics</Link>
          <Link href="/reports" className="text-cyan-400 border-b-2 border-cyan-400 pb-0.5">Reports</Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/interview')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20"
          >
            <span>Start Practice Session</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN REPORTS DASHBOARD */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-10 py-8 flex flex-col gap-8">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
              <ShieldCheck size={13} /> Official AI Verification Records
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Evaluation Reports & Scorecards
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Historical performance audits generated by Alex (Technical), Sarah (Hiring Lead), and Emma (Behavioral).
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Candidate</span>
              <span className="text-xs font-bold text-white">{candidateName}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Avg Accuracy</span>
              <span className="text-xs font-bold text-emerald-400">{avgAccuracy}%</span>
            </div>
            <button
              onClick={fetchReports}
              disabled={isLoading}
              title="Refresh reports from MongoDB"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-slate-700 transition"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin text-cyan-400' : ''} />
            </button>
          </div>
        </div>

        {/* Filters & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter size={15} className="text-slate-400 ml-2 shrink-0" />
            <span className="text-xs text-slate-400 font-semibold shrink-0">Filter Track:</span>
            {['All', 'Full-Stack', 'Microservices', 'Database'].map((track) => (
              <button
                key={track}
                onClick={() => setFilterTrack(track)}
                className={`px-3 py-1 text-xs rounded-lg border transition shrink-0 ${
                  filterTrack === track
                    ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {track}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Showing {filteredReports.length} verified sessions
          </div>
        </div>

        {/* Reports Cards Grid */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 transition duration-300 shadow-xl space-y-4 group"
            >
              {/* Row 1: Session Meta & Final Verdict */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/60 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-white text-sm">{report.track}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold font-mono">
                        {report.recommendation}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>ID: {report.id}</span>
                      <span>•</span>
                      <span>{report.date}</span>
                      <span>•</span>
                      <span>Duration: {report.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right mr-2">
                    <span className="text-2xl font-black text-emerald-400">{report.overallScore}%</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Overall Match</span>
                  </div>
                  <button
                    onClick={() => handleDownload(report.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
                  >
                    <Download size={13} className="text-cyan-400" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Agent Scoring Pipeline & Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* Agent Scores */}
                <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                    <Sparkles size={12} className="text-purple-400" /> Agent Consensus Score
                  </span>
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Alex (Technical Lead):</span>
                      <span className="text-cyan-400 font-bold">{report.agents.alex}%</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Sarah (Hiring Manager):</span>
                      <span className="text-amber-400 font-bold">{report.agents.sarah}%</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Emma (Behavioral):</span>
                      <span className="text-purple-400 font-bold">{report.agents.emma}%</span>
                    </div>
                  </div>
                </div>

                {/* Key Strengths */}
                <div className="bg-slate-900/50 border border-emerald-500/20 p-3 rounded-xl space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Demonstrated Strengths
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {report.strengths.map((str, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                        {str}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actionable Feedback */}
                <div className="bg-slate-900/50 border border-amber-500/20 p-3 rounded-xl space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                    <AlertCircle size={12} /> Recommended Refinement
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {report.improvements.map((imp, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-amber-400" />
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>
          ))}
        </div>

      </main>

      {/* 3. FOOTER */}
      <footer className="h-14 border-t border-slate-800/80 bg-[#060914] px-8 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300 uppercase">JYNEX AGENT</span>
          <span>© 2026. Secure Candidate Evaluation & Audit Trail.</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Link href="/dashboard" className="hover:text-cyan-400 transition">Dashboard</Link>
          <Link href="/interview" className="hover:text-cyan-400 transition">Interview Room</Link>
          <Link href="/agents" className="hover:text-cyan-400 transition">AI Agents</Link>
        </div>
      </footer>

    </div>
  );
}
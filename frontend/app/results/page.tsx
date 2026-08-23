'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Award, CheckCircle, AlertCircle, RotateCcw, Home, 
  Sparkles, TrendingUp, Download, Loader2, BarChart3 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Cell 
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

interface EvaluationReport {
  overall_score: number;
  technical_accuracy: number;
  communication_clarity: number;
  depth_of_knowledge: number;
  strengths: string[];
  areas_for_improvement: string[];
  summary_feedback: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('interview_results');
      if (stored) {
        try {
          setReport(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const data: EvaluationReport = report || {
    overall_score: 82,
    technical_accuracy: 85,
    communication_clarity: 80,
    depth_of_knowledge: 81,
    strengths: ['Clear explanation of project architecture', 'Good terminology usage'],
    areas_for_improvement: ['Provide deeper insight into edge cases', 'Discuss optimization trade-offs'],
    summary_feedback: 'Strong performance overall with clear grasp of fundamentals and good problem-solving articulation.'
  };

  const chartData = [
    { category: 'Technical Accuracy', score: data.technical_accuracy, fill: '#10B981' },
    { category: 'Communication', score: data.communication_clarity, fill: '#06B6D4' },
    { category: 'Depth of Knowledge', score: data.depth_of_knowledge, fill: '#8B5CF6' },
    { category: 'Overall Score', score: data.overall_score, fill: '#3B82F6' },
  ];

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#090D16',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('AI_Interview_Evaluation_Report.pdf');
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 p-6 sm:p-12 font-sans">
      <div ref={reportRef} className="max-w-4xl mx-auto space-y-8 p-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles size={14} /> Evaluation Completed
            </div>
            <h1 className="text-2xl font-bold text-white">Interview Performance Scorecard</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-lg shadow-emerald-600/20"
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              onClick={() => router.push('/setup')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-lg shadow-blue-600/20"
            >
              <RotateCcw size={14} /> Practice Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              <Home size={14} /> Home
            </button>
          </div>
        </div>

        {/* Score Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 p-6 rounded-3xl flex flex-col items-center justify-center text-center">
            <Award className="text-blue-400 mb-2" size={32} />
            <span className="text-3xl font-extrabold text-white">{data.overall_score}%</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Overall Score</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl text-center flex flex-col justify-center">
            <span className="text-2xl font-bold text-emerald-400">{data.technical_accuracy}%</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium mt-1">Technical Accuracy</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl text-center flex flex-col justify-center">
            <span className="text-2xl font-bold text-cyan-400">{data.communication_clarity}%</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium mt-1">Communication</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl text-center flex flex-col justify-center">
            <span className="text-2xl font-bold text-purple-400">{data.depth_of_knowledge}%</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium mt-1">Knowledge Depth</span>
          </div>
        </div>

        {/* Performance Bar Chart */}
        <div className="bg-slate-900/50 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-6">
            <BarChart3 size={16} className="text-emerald-400" /> Visual Performance Metrics
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="category" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#F8FAFC' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Summary Feedback */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-blue-400" /> Executive AI Summary
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
            {data.summary_feedback}
          </p>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-emerald-950/10 border border-emerald-500/20 p-6 rounded-3xl">
            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <CheckCircle size={16} /> Key Strengths
            </h3>
            <ul className="space-y-2.5">
              {data.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-950/10 border border-amber-500/20 p-6 rounded-3xl">
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <AlertCircle size={16} /> Areas For Improvement
            </h3>
            <ul className="space-y-2.5">
              {data.areas_for_improvement.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Brain, CheckCircle2, AlertTriangle, 
  Calendar, Award, X, Copy, Check 
} from 'lucide-react';

export default function AiInsightsModal({ isOpen, onClose, insightsData, loading }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!insightsData) return;
    const text = `AI Academic Insights for ${insightsData.student?.name || 'Student'}\n\n` +
      `Executive Summary: ${insightsData.overall_verdict}\n\n` +
      `Strengths:\n${(insightsData.strengths || []).map(s => `- ${s}`).join('\n')}\n\n` +
      `Focus Areas:\n${(insightsData.weaknesses || []).map(w => `- ${w}`).join('\n')}\n\n` +
      `4-Week Study Plan:\n` +
      (insightsData.study_plan || []).map(p => `Week ${p.week} (${p.focus}): ${p.action}`).join('\n');
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-[#0a1020] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto space-y-6 text-slate-200 divide-y divide-white/10"
        >

          {/* CLOSE BUTTON */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pr-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <Brain className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Fraunces', serif" }}>
                  Gemini LLM Student Insights
                </h3>
                <p className="text-xs text-slate-400">
                  {insightsData?.student?.name ? `Personalized diagnostic report for ${insightsData.student.name}` : 'AI Generated Learning Recommendations'}
                </p>
              </div>
            </div>

            {insightsData?.source && (
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[11px] font-mono font-bold text-cyan-300">
                ✨ {insightsData.source}
              </span>
            )}
          </div>

          {/* BODY CONTENT */}
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <Sparkles className="mx-auto text-cyan-400 animate-spin" size={40} />
              <p className="text-sm font-medium text-slate-300">Querying Gemini LLM & synthesizing telemetry...</p>
            </div>
          ) : insightsData ? (
            <div className="pt-6 space-y-6">

              {/* EXECUTIVE VERDICT */}
              <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-slate-900 border border-cyan-500/30 p-5 rounded-2xl space-y-2 relative overflow-hidden">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <Sparkles size={16} /> Executive Verdict
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {insightsData.overall_verdict}
                </p>
              </div>

              {/* STRENGTHS & WEAKNESSES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* STRENGTHS */}
                <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Key Strengths & Mastery
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(insightsData.strengths || []).map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* WEAKNESSES */}
                <div className="bg-white/5 border border-amber-500/20 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <AlertTriangle size={16} /> Focus Areas & Vulnerabilities
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(insightsData.weaknesses || []).map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* 4-WEEK REMEDIAL STUDY PLAN TIMELINE */}
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={18} className="text-cyan-400" /> 4-Week Actionable Study Plan
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(insightsData.study_plan || []).map((plan, idx) => (
                    <div key={idx} className="bg-[#121c33] border border-white/10 rounded-2xl p-4 space-y-1.5 hover:border-cyan-500/30 transition-all">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono font-bold text-cyan-400">Week {plan.week || idx + 1}</span>
                        <span className="text-[10px] font-semibold bg-cyan-500/10 px-2 py-0.5 rounded-md text-cyan-300">
                          {plan.focus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pt-1">
                        {plan.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* COUNSELOR NOTES & ACTIONS */}
              {insightsData.counselor_notes && (
                <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl text-xs text-slate-400 space-y-1">
                  <span className="font-bold text-white">Faculty Guidance Note:</span>
                  <p>{insightsData.counselor_notes}</p>
                </div>
              )}

              {/* ACTION FOOTER */}
              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copied ? 'Copied to Clipboard!' : 'Copy Summary'}
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-sm">
              No AI insight data available for this student.
            </div>
          )}

        </motion.div>

      </div>
    </AnimatePresence>
  );
}

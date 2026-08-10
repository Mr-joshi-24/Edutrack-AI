import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, CheckCircle2, AlertTriangle, 
  Award, X, Copy, Check, Calculator, Activity, TrendingUp, ShieldAlert, Sparkles
} from 'lucide-react';

export default function MlPerformanceModal({ isOpen, onClose, mlData, loading }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!mlData) return;
    const text = `Scikit-Learn ML Performance Profile for ${mlData.student?.name || 'Student'}\n` +
      `Risk Level: ${mlData.risk_level} Risk\n` +
      `Pass Probability: ${mlData.pass_probability}%\n` +
      `Grade Projection: ${mlData.grade_projection}\n` +
      `Attendance Rate: ${mlData.calculator?.attendance_rate}%\n` +
      (mlData.calculator?.is_defaulter 
        ? `Attendance Target: Must attend ${mlData.calculator?.classes_needed_for_75} consecutive lectures to reach 75% threshold.` 
        : `Attendance Buffer: Safe to miss up to ${mlData.calculator?.safe_bunks_allowed} lectures.`) +
      ` Recommendation: ${mlData.recommendation}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-[#0a1020] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto space-y-6 text-slate-200 divide-y divide-white/10"
        >

          {/* CLOSE BUTTON */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pr-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] shrink-0">
                <BrainCircuit className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Fraunces', serif" }}>
                  ML Student Performance Profile
                </h3>
                <p className="text-xs text-slate-400">
                  {mlData?.student?.name ? `Scikit-Learn Random Forest Diagnostic for ${mlData.student.name}` : 'Quantitative Predictive Diagnostics'}
                </p>
              </div>
            </div>

            {mlData?.confidence_score && (
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[11px] font-mono font-bold text-cyan-300">
                ⚡ Scikit-Learn ({mlData.confidence_score} Confidence)
              </span>
            )}
          </div>

          {/* BODY CONTENT */}
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <BrainCircuit className="mx-auto text-cyan-400 animate-pulse" size={44} />
              <p className="text-sm font-medium text-slate-300">Executing Random Forest classifier pipeline...</p>
            </div>
          ) : mlData ? (
            <div className="pt-6 space-y-6">

              {/* 1. TOP METRIC CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Risk Assessment */}
                <div className={`p-4 rounded-2xl border ${mlData.risk_level === 'High' ? 'bg-red-500/10 border-red-500/30' : mlData.risk_level === 'Medium' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                    <ShieldAlert size={14} /> Risk Level
                  </p>
                  <p className={`text-xl font-bold ${mlData.risk_level === 'High' ? 'text-red-400' : mlData.risk_level === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {mlData.risk_level} Risk
                  </p>
                </div>

                {/* Grade Projection */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                    <Award size={14} className="text-cyan-400" /> Grade Projection
                  </p>
                  <p className="text-xl font-bold text-cyan-300">{mlData.grade_projection}</p>
                </div>

                {/* Pass Probability */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                    <TrendingUp size={14} className="text-emerald-400" /> Pass Probability
                  </p>
                  <p className="text-xl font-bold text-white">{mlData.pass_probability}%</p>
                </div>

              </div>

              {/* 2. ATTENDANCE THRESHOLD & BUNK/RECOVERY CALCULATOR */}
              {mlData.calculator && (
                <div className="bg-gradient-to-r from-blue-950/40 via-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <Calculator size={16} /> Attendance Safety & Recovery Calculator
                    </h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${mlData.calculator.is_defaulter ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                      {mlData.calculator.attendance_rate}% Current Rate
                    </span>
                  </div>

                  {mlData.calculator.is_defaulter ? (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-200 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-red-400">
                        <AlertTriangle size={15} /> Below Mandatory 75% Requirement!
                      </p>
                      <p>
                        Student needs to attend <span className="font-bold underline text-white">{mlData.calculator.classes_needed_for_75} consecutive lectures</span> to reach the safe 75% threshold.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-200 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 size={15} /> Safe Status (Above 75%)
                      </p>
                      <p>
                        Student can safely miss up to <span className="font-bold underline text-white">{mlData.calculator.safe_bunks_allowed} classes</span> before dropping below the 75% threshold.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 3. SCIKIT-LEARN FEATURE WEIGHT IMPORTANCE */}
              {mlData.feature_weights && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Activity size={16} className="text-cyan-400" /> Random Forest Feature Weight Distribution
                  </h4>
                  <div className="space-y-2">
                    
                    {/* Attendance Weight */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Class Attendance Impact</span>
                        <span className="font-mono text-cyan-400 font-bold">{mlData.feature_weights.attendance_weight}%</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${mlData.feature_weights.attendance_weight}%` }} />
                      </div>
                    </div>

                    {/* Marks Weight */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Exam Marks Average</span>
                        <span className="font-mono text-emerald-400 font-bold">{mlData.feature_weights.marks_weight}%</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${mlData.feature_weights.marks_weight}%` }} />
                      </div>
                    </div>

                    {/* Consistency Weight */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Test Attempt Consistency</span>
                        <span className="font-mono text-purple-400 font-bold">{mlData.feature_weights.consistency_weight}%</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${mlData.feature_weights.consistency_weight}%` }} />
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* 4. MODEL RECOMMENDATION */}
              <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl text-xs text-slate-300 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5 text-cyan-400">
                  <Sparkles size={14} /> Actionable Model Recommendation:
                </span>
                <p className="leading-relaxed">{mlData.recommendation}</p>
              </div>

              {/* ACTION FOOTER */}
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copied ? 'Copied ML Report!' : 'Copy Summary'}
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close Profile
                </button>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-sm">
              No ML prediction data available for this student.
            </div>
          )}

        </motion.div>

      </div>
    </AnimatePresence>
  );
}

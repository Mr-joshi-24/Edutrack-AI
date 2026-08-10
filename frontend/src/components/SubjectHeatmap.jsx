import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, AlertTriangle, CheckCircle2, Flame, RefreshCw } from 'lucide-react';
import { fetchSubjectHeatmap } from '../services/api';

export default function SubjectHeatmap() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHeatmap();
  }, []);

  const loadHeatmap = async () => {
    try {
      setLoading(true);
      const data = await fetchSubjectHeatmap();
      setHeatmapData(data || []);
    } catch (err) {
      console.error("Failed to load subject heatmap", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl animate-pulse text-slate-400 text-sm">
        Loading subject difficulty heatmap...
      </div>
    );
  }

  const toughestSubject = heatmapData.length > 0 ? heatmapData[0] : null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Fraunces', serif" }}>
            <Flame className="text-amber-400" size={24} /> Class Subject Difficulty & Performance Heatmap
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cohort-wide breakdown of average scores and pass rates across subjects.
          </p>
        </div>

        <button 
          onClick={loadHeatmap}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          title="Refresh Heatmap"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {toughestSubject && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="text-amber-400 shrink-0" size={20} />
          <p className="text-xs text-amber-200">
            <span className="font-bold text-white">{toughestSubject.subject}</span> currently has the lowest pass rate ({toughestSubject.pass_rate}%) in the cohort. Recommend extra tutorial sessions.
          </p>
        </div>
      )}

      {/* HEATMAP GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {heatmapData.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-500 text-sm">
            No subject mark records available yet to generate heatmap.
          </div>
        ) : (
          heatmapData.map((item, idx) => {
            let badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            let barGradient = "from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
            
            if (item.difficulty === "High") {
              badgeClass = "bg-red-500/10 text-red-400 border-red-500/20";
              barGradient = "from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
            } else if (item.difficulty === "Moderate") {
              badgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
              barGradient = "from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
            }

            return (
              <div 
                key={idx} 
                className="bg-[#0a1020] border border-white/10 rounded-2xl p-5 space-y-4 hover:border-white/20 transition-all shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-base flex items-center gap-2">
                      <BookOpen size={16} className="text-cyan-400" /> {item.subject}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{item.total_records} Evaluation Records</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                    {item.difficulty} Difficulty
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Pass Rate:</span>
                    <span className="font-bold text-white">{item.pass_rate}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${barGradient} transition-all duration-700`}
                      style={{ width: `${item.pass_rate}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/5 text-xs text-slate-400">
                  <span>Average Mark Score:</span>
                  <span className="font-bold text-cyan-300 font-mono">{item.average_percentage}%</span>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

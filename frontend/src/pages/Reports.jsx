import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, Download, FileText, Search, Sparkles, CheckCircle2,
  Users, TrendingUp, Award, AlertTriangle, FileSpreadsheet, Brain
} from 'lucide-react';

import StatCard from '../components/StatCard';
import FloatingButton from '../components/FloatingButton';
import MlPerformanceModal from '../components/MlPerformanceModal';
import { 
  downloadCompiledMarksheet, fetchStudents, fetchMarks, 
  fetchAtRiskStudents, fetchMlPrediction 
} from '../services/api';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('export'); // 'export', 'ml'
  const [downloading, setDownloading] = useState(false);

  // Real Data States
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [atRiskList, setAtRiskList] = useState([]);

  // ML State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);

  const [insightsModalOpen, setInsightsModalOpen] = useState(false);
  const [mlModalData, setMlModalData] = useState(null);

  useEffect(() => {
    const loadRealData = async () => {
      try {
        setLoading(true);
        const [studentsData, marksData, riskData] = await Promise.all([
          fetchStudents().catch(() => []),
          fetchMarks().catch(() => []),
          fetchAtRiskStudents().catch(() => [])
        ]);
        setStudents(studentsData || []);
        setMarks(marksData || []);
        setAtRiskList(riskData || []);
      } catch (err) {
        console.error("Failed to load reports data", err);
      } finally {
        setLoading(false);
      }
    };
    loadRealData();
  }, []);

  const passRate = marks.length > 0 ? Math.round((marks.filter(m => m.marks >= 40).length / marks.length) * 100) : 0;
  const avgMarks = marks.length > 0 ? Math.round(marks.reduce((a, b) => a + b.marks, 0) / marks.length) : 0;
  const avgCgpa = (avgMarks / 9.5).toFixed(1); 

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadCompiledMarksheet();
    } catch (err) {
      alert("Failed to download master marksheet.");
    } finally {
      setDownloading(false);
    }
  };

  const handleRunPrediction = async () => {
    if (!selectedStudentId) return alert("Please select a student first.");
    setMlLoading(true);
    
    try {
      const result = await fetchMlPrediction(selectedStudentId);
      const student = students.find(s => s.id === parseInt(selectedStudentId));
      
      setPredictionResult({
        student,
        riskLevel: result.risk_level,
        recommendation: result.recommendation,
        gradeProjection: result.grade_projection,
        passProbability: result.pass_probability,
        confidenceScore: result.confidence_score
      });
    } catch (err) {
      console.error("ML Prediction Error:", err);
      alert("Failed to fetch machine learning prediction from backend.");
    } finally {
      setMlLoading(false);
    }
  };

  return (
    <div className="w-full text-slate-200 space-y-6 animate-in fade-in duration-500 pb-10 relative">
      
      {/* HEADER & EXPORT */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
            Academic Reports & AI Analytics
          </h1>
          <p className="text-slate-400 text-sm">Visualize performance, export master marksheets, and generate AI insights.</p>
        </div>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Students" value={students.length} icon={Users} color="text-blue-400" />
        <StatCard title="Avg CGPA" value={avgCgpa} icon={TrendingUp} color="text-emerald-400" />
        <StatCard title="Pass Rate" value={`${passRate}%`} icon={Award} color="text-cyan-400" />
        <StatCard title="At Risk" value={atRiskList.length} icon={AlertTriangle} color="text-red-400" isDanger={atRiskList.length > 0} />
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-white/10 gap-2 pb-1 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('export')} 
          className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-sm font-medium transition-all relative shrink-0 ${activeTab === 'export' ? 'text-white bg-white/10 border-t border-x border-white/10' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <FileSpreadsheet size={16} className={activeTab === 'export' ? 'text-emerald-400' : ''} /> Master Marksheet Export
        </button>
        <button 
          onClick={() => setActiveTab('ml')} 
          className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-sm font-medium transition-all relative shrink-0 ${activeTab === 'ml' ? 'text-white bg-white/10 border-t border-x border-white/10' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <BrainCircuit size={16} className={activeTab === 'ml' ? 'text-cyan-400' : ''} /> ML Predictive Analytics
        </button>
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: MASTER EXPORT */}
        {activeTab === 'export' && (
          <motion.div key="export" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Compiled Excel Marksheet</h3>
                <p className="text-xs text-slate-400">Download formatted student marks across all subjects (COA, TOC, DM, FCSP-2, FSD-2).</p>
              </div>
            </div>

            <div className="p-4 bg-[#0a1020] border border-white/10 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>File Format:</span> <span className="text-white font-mono">.XLSX (Excel Workbook)</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Students Included:</span> <span className="text-white font-mono">{students.length} Students</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Mark Records:</span> <span className="text-white font-mono">{marks.length} Records</span>
              </div>
            </div>

            <button 
              onClick={handleDownload} 
              disabled={downloading}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 disabled:opacity-50 cursor-pointer"
            >
              <Download size={18} /> {downloading ? "Generating Master Excel Sheet..." : "Export Full Academic Marksheet (.xlsx)"}
            </button>
          </motion.div>
        )}

        {/* TAB 2: ML PREDICTIVE ANALYTICS */}
        {activeTab === 'ml' && (
          <motion.div key="ml" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT: SELECT STUDENT */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BrainCircuit className="text-cyan-400" size={20} /> Execute ML Risk Model
              </h3>
              <p className="text-xs text-slate-400">
                Select a student from the directory to analyze their risk score, pass probability %, and performance vectors.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Student</label>
                <select 
                  value={selectedStudentId} 
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-[#0a1020] border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
                >
                  <option value="">Select a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleRunPrediction}
                disabled={mlLoading || !selectedStudentId}
                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> {mlLoading ? "Running Machine Learning Model..." : "Run ML Risk Diagnostics"}
              </button>
            </div>

            {/* RIGHT: PREDICTION DISPLAY */}
            <div className="lg:col-span-2 space-y-6">
              {predictionResult ? (
                <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/5 border border-cyan-500/30 rounded-3xl p-6 backdrop-blur-xl space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">{predictionResult.student?.name}</h3>
                      <p className="text-xs text-slate-400">{predictionResult.student?.email}</p>
                    </div>

                    <button 
                      onClick={async () => {
                        setInsightsModalOpen(true);
                        setMlModalData(null);
                        try {
                          const data = await fetchMlPrediction(predictionResult.student.id);
                          setMlModalData(data);
                        } catch (e) {
                          alert("Failed to load details");
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={14} /> View Full ML Diagnostics Modal
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-[#0a1020] p-4 rounded-2xl border border-white/5">
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Predicted Risk Level</p>
                      <p className={`text-lg font-bold ${predictionResult.riskLevel === 'Low' ? 'text-emerald-400' : predictionResult.riskLevel === 'Medium' ? 'text-amber-400' : 'text-red-400'}`}>
                        {predictionResult.riskLevel} Risk
                      </p>
                    </div>

                    <div className="bg-[#0a1020] p-4 rounded-2xl border border-white/5">
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Pass Probability</p>
                      <p className="text-lg font-bold text-cyan-400">{predictionResult.passProbability}%</p>
                    </div>

                    <div className="bg-[#0a1020] p-4 rounded-2xl border border-white/5">
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Projected Grade</p>
                      <p className="text-lg font-bold text-white">{predictionResult.gradeProjection}</p>
                    </div>
                  </div>

                  <div className="bg-[#0a1020] p-4 rounded-2xl border border-white/5 space-y-2">
                    <p className="text-slate-400 text-xs font-bold uppercase">ML Recommendation:</p>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {predictionResult.recommendation}
                    </p>
                    <div className="flex items-center gap-6 pt-2 text-xs text-slate-400 font-mono">
                      <span>Student ID: #{predictionResult.student?.id}</span>
                      <span>Attendance: {predictionResult.student?.attendance}%</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center backdrop-blur-xl flex flex-col items-center justify-center text-slate-500">
                  <BrainCircuit size={48} className="mb-4 opacity-30 text-cyan-400" />
                  <p className="text-base font-medium text-slate-400">Select a student and execute the Random Forest model to view statistical forecasts.</p>
                </div>
              )}
            </div>

          </motion.div>
        )}

      </AnimatePresence>

      <MlPerformanceModal 
        isOpen={insightsModalOpen}
        onClose={() => setInsightsModalOpen(false)}
        mlData={mlModalData}
        loading={mlLoading}
      />

      <FloatingButton />
    </div>
  );
}
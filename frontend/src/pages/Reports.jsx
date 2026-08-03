import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, Download, FileText, Search, Sparkles, CheckCircle2,
  Users, TrendingUp, Award, AlertTriangle, FileSpreadsheet
} from 'lucide-react';

import StatCard from '../components/StatCard';
import FloatingButton from '../components/FloatingButton';
import { 
  downloadCompiledMarksheet, fetchStudents, fetchMarks, 
  fetchAtRiskStudents, fetchMlPrediction 
} from '../services/api';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('export'); // 'export' or 'ml'
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
      // Call real backend scikit-learn ML endpoint
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
      <div className="flex border-b border-white/10 gap-2 pb-1">
        <button 
          onClick={() => setActiveTab('export')} 
          className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-sm font-medium transition-all relative ${activeTab === 'export' ? 'text-white bg-white/10 border-t border-x border-white/10' : 'text-slate-400 hover:bg-white/5'}`}
        >
          <FileSpreadsheet size={16} className={activeTab === 'export' ? 'text-emerald-400' : ''} /> Master Marksheet Export
        </button>
        <button 
          onClick={() => setActiveTab('ml')} 
          className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-sm font-medium transition-all relative ${activeTab === 'ml' ? 'text-white bg-white/10 border-t border-x border-white/10' : 'text-slate-400 hover:bg-white/5'}`}
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
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <FileSpreadsheet size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Master Semester Marksheet</h3>
                <p className="text-xs text-slate-400 mt-0.5">Automated compilation of T1, T2, T3, T4 marks into a single spreadsheet.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 size={16} className="text-emerald-400" /> Automatically aggregates all imported subject columns.
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 size={16} className="text-emerald-400" /> Calculates overall aggregate scores and Pass/Fail statuses.
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 size={16} className="text-emerald-400" /> Formatted with automatic cell color highlighting.
              </div>
            </div>

            <button 
              onClick={handleDownload} 
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
            >
              <Download size={18} /> {downloading ? "Generating Master Spreadsheet..." : "Download Compiled Master Marksheet"}
            </button>
          </motion.div>
        )}

        {/* TAB 2: ML PREDICTIVE ANALYTICS ENGINE */}
        {activeTab === 'ml' && (
          <motion.div key="ml" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* CONTROL PANEL */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6 h-fit relative">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <BrainCircuit size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Model Configuration</h3>
                  <p className="text-xs text-slate-400">Random Forest Classifier Pipeline</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-xs text-slate-400 uppercase font-medium mb-2">Search Student Target</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Type student name (e.g., K)..." 
                      value={selectedStudentId ? students.find(s => s.id === parseInt(selectedStudentId))?.name || '' : searchQuery} 
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedStudentId('');
                      }} 
                      className="w-full bg-[#1e293b] border border-white/10 text-sm text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-cyan-500" 
                    />
                  </div>
                  
                  {searchQuery && !selectedStudentId && (
                    <div className="absolute left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl max-h-48 overflow-y-auto z-25">
                      {students
                        .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(s => (
                          <div 
                            key={s.id} 
                            onClick={() => {
                              setSelectedStudentId(s.id);
                              setSearchQuery('');
                            }}
                            className="px-4 py-2.5 hover:bg-cyan-500/20 cursor-pointer text-sm text-slate-200 border-b border-white/5"
                          >
                            {s.name} <span className="text-xs text-slate-500 font-mono">({s.email})</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleRunPrediction} 
                  disabled={!selectedStudentId || mlLoading}
                  className="w-full py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles size={18} /> {mlLoading ? "Running scikit-learn Inference..." : "Execute ML Prediction"}
                </button>
              </div>
            </div>

            {/* RESULTS PANEL */}
            <div className="lg:col-span-2 space-y-6">
              {predictionResult ? (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                      <p className="text-xs text-slate-400 uppercase font-medium mb-1">Risk Assessment</p>
                      <p className={`text-2xl font-bold ${predictionResult.riskLevel === 'High' ? 'text-red-400' : predictionResult.riskLevel === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {predictionResult.riskLevel} Risk
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                      <p className="text-xs text-slate-400 uppercase font-medium mb-1">Predicted Trajectory</p>
                      <p className="text-2xl font-bold text-cyan-400">{predictionResult.gradeProjection}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                      <p className="text-xs text-slate-400 uppercase font-medium mb-1">Pass Probability</p>
                      <p className="text-2xl font-bold text-white">{predictionResult.passProbability}% <span className="text-xs text-slate-500 font-normal">({predictionResult.confidenceScore} Model Confidence)</span></p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 rounded-3xl p-8 backdrop-blur-xl space-y-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <Sparkles className="text-cyan-400" size={24} />
                      <h3 className="text-lg font-bold text-white">AI Intervention Plan for {predictionResult.student.name}</h3>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/5">
                      {predictionResult.recommendation}
                    </p>
                    <div className="flex items-center gap-6 pt-2 text-xs text-slate-400 font-mono">
                      <span>Student ID: #{predictionResult.student.id}</span>
                      <span>Attendance: {predictionResult.student.attendance}%</span>
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

      <FloatingButton />
    </div>
  );
}
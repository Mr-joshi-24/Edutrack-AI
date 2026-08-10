import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Search, Eye, X, FileSpreadsheet, Sparkles, BookOpen, Users, 
  UploadCloud, BrainCircuit, Activity
} from 'lucide-react';

import StatCard from '../components/StatCard';
import FloatingButton from '../components/FloatingButton';

import { 
  fetchStudents, fetchMarks, fetchAtRiskStudents, 
  downloadCompiledMarksheet, uploadBulkMarks
} from '../services/api';

// --- SMART GRADING LOGIC MATCHING YOUR COLLEGE SYSTEM ---
const getExamMaxMarks = (examType) => {
  if (!examType) return 25; 
  const type = examType.toUpperCase();
  if (type.includes("T4")) return 50;
  if (type.includes("T1") || type.includes("T2") || type.includes("T3")) return 25;
  return 25; // Default fallback for unknown exams
};

const calculateGrade = (marks, examType) => {
  const val = Number(marks) || 0;
  const maxMarks = getExamMaxMarks(examType);
  const percentage = (val / maxMarks) * 100;

  if (percentage >= 90) return { letter: "A+", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  if (percentage >= 80) return { letter: "A", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" };
  if (percentage >= 70) return { letter: "B", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
  if (percentage >= 60) return { letter: "C", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
  if (percentage >= 45) return { letter: "D", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
  if (percentage >= 35) return { letter: "P", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" };
  return { letter: "F", color: "text-red-400 bg-red-500/10 border-red-500/20" };
};

export default function Marks() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [marksList, setMarksList] = useState([]);
  const [atRiskList, setAtRiskList] = useState([]);

  const [activeTab, setActiveTab] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [analysisSearchQuery, setAnalysisSearchQuery] = useState('');
  const [selectedStudentForAnalysis, setSelectedStudentForAnalysis] = useState('');
  
  const [csvFile, setCsvFile] = useState(null);
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadExamType, setUploadExamType] = useState('T1');
  const [isUploading, setIsUploading] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleFileSelect = (file) => {
    setCsvFile(file);
    if (!file) return;
    const nameClean = file.name.replace(/\.[^/.]+$/, "");
    
    // 1. Detect exam type
    let detectedExam = "T1";
    const upper = nameClean.toUpperCase();
    ["T1", "T2", "T3", "T4", "MID", "END"].forEach(e => {
      if (upper.includes(e)) detectedExam = e;
    });
    setUploadExamType(detectedExam);

    // 2. Detect subject name
    const parts = nameClean.split(/[_ \-]/).filter(Boolean);
    const ignore = new Set(["T1","T2","T3","T4","MARKS","MARKSHEET","SCORES","SY1","SY2","SY3","TY","BTECH","BATCH","A","B","C","D","FINAL","MID","SEM","SEM1","SEM2","SEM3","SEM4","SEM5","SEM6","SEM7","SEM8","EXAM","RESULT"]);
    const subjectParts = parts.filter(p => !ignore.has(p.toUpperCase()) && isNaN(p));
    if (subjectParts.length > 0) {
      const formatted = subjectParts.map(p => p.length <= 4 && /^[a-zA-Z]+$/.test(p) ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
      setUploadSubject(formatted);
    } else {
      setUploadSubject("");
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [studentsData, marksData, riskData] = await Promise.all([
        fetchStudents().catch(() => []),
        fetchMarks().catch(() => []),
        fetchAtRiskStudents().catch(() => [])
      ]);
      setStudents(studentsData || []);
      setMarksList(marksData || []);
      setAtRiskList(riskData || []);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. EXTRACT DYNAMIC SUBJECTS AND THEIR SUB-EXAMS (T1, T2, T3)
  const subjectStructure = useMemo(() => {
    const struct = {};
    marksList.forEach(m => {
      const sub = m.subject || "General";
      const ext = m.exam_type || "T1";
      if (!struct[sub]) struct[sub] = new Set();
      struct[sub].add(ext);
    });
    
    const finalStruct = {};
    Object.keys(struct).sort().forEach(sub => {
      finalStruct[sub] = Array.from(struct[sub]).sort((a, b) => a.localeCompare(b));
    });
    return finalStruct;
  }, [marksList]);

  // 2. PIVOT THE DATA (Group marks by Student -> Subject -> Exam Type)
  const pivotData = useMemo(() => {
    const map = {};
    
    students.forEach(s => {
      map[s.id] = { id: s.id, name: s.name, email: s.email, subjects: {} };
    });

    marksList.forEach(m => {
      if (map[m.student_id]) {
        const sub = m.subject || "General";
        const ext = m.exam_type || "T1";
        if (!map[m.student_id].subjects[sub]) {
          map[m.student_id].subjects[sub] = {};
        }
        map[m.student_id].subjects[sub][ext] = m.marks;
      }
    });

    return Object.values(map).filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [marksList, students, searchQuery]);

  // Metrics for Top Cards
  const metrics = useMemo(() => {
    if (marksList.length === 0) return { totalStudents: students.length, highestScore: 0, passRate: 0 };
    const percentages = marksList.map(m => (Number(m.marks) / getExamMaxMarks(m.exam_type)) * 100);
    const passing = marksList.filter(m => (Number(m.marks) / getExamMaxMarks(m.exam_type)) * 100 >= 35).length;
    return {
      totalStudents: students.length,
      highestScore: Math.round(Math.max(...percentages)),
      passRate: Math.round((passing / marksList.length) * 100)
    };
  }, [marksList, students]);

  // Generate Analysis
  const generateAnalysis = () => {
    if (!selectedStudentForAnalysis) return null;
    const student = students.find(s => s.id === parseInt(selectedStudentForAnalysis));
    if (!student) return null;
    
    const sMarks = marksList.filter(m => m.student_id === student.id).map(m => ({
      ...m,
      maxMarks: getExamMaxMarks(m.exam_type),
      percentage: Math.round((Number(m.marks) / getExamMaxMarks(m.exam_type)) * 100),
      gradeInfo: calculateGrade(m.marks, m.exam_type)
    }));
    
    if (sMarks.length === 0) return { student, noData: true };

    const sortedMarks = [...sMarks].sort((a, b) => b.percentage - a.percentage);
    const strongest = sortedMarks[0];
    const weakest = sortedMarks[sortedMarks.length - 1];
    
    let insights = [];
    if (student.attendance < 75) insights.push(`⚠️ Critical: Attendance is at ${student.attendance}%. Must improve immediately.`);
    else insights.push(`✅ Good attendance consistency (${student.attendance}%).`);
    
    if (weakest.percentage < 35) insights.push(`🚨 Failing in ${weakest.subject} ${weakest.exam_type} (${weakest.marks}/${weakest.maxMarks}). Needs immediate focus.`);
    else insights.push(`📈 Passing all exams. Lowest score is in ${weakest.subject} (${weakest.percentage}%).`);
    
    if (strongest.percentage >= 80) insights.push(`🌟 Excellent performance in ${strongest.subject} ${strongest.exam_type} (${strongest.percentage}%).`);

    return { student, sMarks, strongest, weakest, insights };
  };

  const analysisData = generateAnalysis();

  return (
    <div className="w-full text-slate-200 space-y-8 animate-in fade-in duration-500 relative pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 tracking-wide" style={{ fontFamily: "'Fraunces', serif" }}>
            Marks Management
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">Import T1, T2, T3, or T4 marks, view academic performance, and export compiled master sheets.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 transition-all text-sm font-medium text-white shadow-lg">
            <UploadCloud size={16} /> Import Excel / CSV
          </button>
          <button onClick={downloadCompiledMarksheet} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-sm font-medium text-emerald-300">
            <FileSpreadsheet size={16} /> Export Compiled Marksheet
          </button>
        </div>
      </div>

      {/* TOP STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <StatCard title="Total Students" value={metrics.totalStudents} icon={Users} />
        <StatCard title="Highest Score %" value={`${metrics.highestScore}%`} icon={Award} color="text-amber-400" />
        <StatCard title="Overall Pass Rate" value={`${metrics.passRate}%`} ring={metrics.passRate} />
        <StatCard title="Students At Risk" value={atRiskList.length} icon={Activity} color="text-red-400" isDanger={atRiskList.length > 0} />
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-white/10 gap-2 pb-1">
        <button onClick={() => setActiveTab('table')} className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-sm font-medium transition-all relative ${activeTab === 'table' ? 'text-white bg-white/10 border-t border-x border-white/10' : 'text-slate-400 hover:bg-white/5'}`}>
          <BookOpen size={16} className={activeTab === 'table' ? 'text-blue-400' : ''} /> Master Data Table
        </button>
        <button onClick={() => setActiveTab('analysis')} className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl text-sm font-medium transition-all relative ${activeTab === 'analysis' ? 'text-white bg-white/10 border-t border-x border-white/10' : 'text-slate-400 hover:bg-white/5'}`}>
          <BrainCircuit size={16} className={activeTab === 'analysis' ? 'text-cyan-400' : ''} /> Single Student Analysis
        </button>
      </div>

      {/* TAB 1: PIVOT MASTER TABLE */}
      {activeTab === 'table' && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by student name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 text-sm text-white rounded-full pl-11 pr-4 py-3 focus:outline-none focus:border-blue-500 backdrop-blur-md" />
          </div>

          {/* TABLE CONTAINER WITH UI-MATCHED BACKGROUND */}
          <div className="bg-white/5 border border-white/10 rounded-3xl shadow-lg overflow-hidden backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  {/* MAIN HEADER ROW (SUBJECTS) */}
                  <tr>
                    <th rowSpan={2} className="px-6 py-4 border-b border-r border-white/10 sticky left-0 bg-[#0f172a] z-10 w-64 min-w-[250px]">Student Details</th>
                    {Object.keys(subjectStructure).length === 0 && <th className="px-6 py-4 border-b border-white/10">No Data Uploaded</th>}
                    
                    {Object.keys(subjectStructure).map(sub => (
                      <th key={sub} colSpan={subjectStructure[sub].length} className="px-6 py-3 text-center border-b border-r border-white/10 text-cyan-400 bg-cyan-900/10">
                        {sub}
                      </th>
                    ))}
                  </tr>
                  {/* SUB-HEADER ROW (EXAM TYPES: T1, T2, T3) */}
                  <tr>
                    {Object.keys(subjectStructure).map(sub => 
                      subjectStructure[sub].map(ext => (
                        <th key={`${sub}-${ext}`} className="px-3 py-2 text-center border-b border-r border-white/10 bg-white/5">
                          {ext} <span className="text-[9px] text-slate-500 block opacity-70">Out of {getExamMaxMarks(ext)}</span>
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-white/5">
                  {pivotData.length === 0 ? (
                    <tr><td colSpan={100} className="text-center py-10 text-slate-500">No student records found.</td></tr>
                  ) : pivotData.map((student) => (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3 border-r border-white/10 sticky left-0 bg-[#0f172a] z-10 w-64 min-w-[250px]">
                        <p className="font-bold text-white truncate">{student.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{student.email}</p>
                      </td>
                      
                      {/* MAP OVER EVERY SUBJECT AND ITS EXAMS */}
                      {Object.keys(subjectStructure).map(sub => 
                        subjectStructure[sub].map(ext => {
                          const mark = student.subjects[sub]?.[ext];
                          const maxMarks = getExamMaxMarks(ext);
                          const isPass = mark !== undefined && (mark / maxMarks) * 100 >= 35;
                          
                          return (
                            <td key={`${sub}-${ext}`} className="px-3 py-3 text-center border-r border-white/5 min-w-[80px]">
                              {mark !== undefined ? (
                                <span className={`text-[13px] font-bold ${isPass ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {mark}
                                </span>
                              ) : (
                                <span className="text-slate-600 font-light">-</span>
                              )}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT ANALYSIS */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-lg relative">
            <label className="block text-xs text-slate-400 uppercase font-medium mb-2">Search & Select Student for Analysis</label>
            
            {/* Searchable Input with Instant Suggestions */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Type student name (e.g., K)..." 
                value={selectedStudentForAnalysis ? students.find(s => s.id === parseInt(selectedStudentForAnalysis))?.name || '' : analysisSearchQuery} 
                onChange={(e) => {
                  setAnalysisSearchQuery(e.target.value);
                  setSelectedStudentForAnalysis(''); // Reset selection when user types a new query
                }} 
                className="w-full bg-[#1e293b] border border-white/10 text-sm text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-blue-500" 
              />
              
              {/* Suggestion Dropdown List */}
              {analysisSearchQuery && !selectedStudentForAnalysis && (
                <div className="absolute left-0 right-0 mt-2 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-20">
                  {students
                    .filter(s => s.name.toLowerCase().includes(analysisSearchQuery.toLowerCase()))
                    .map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => {
                          setSelectedStudentForAnalysis(s.id);
                          setAnalysisSearchQuery('');
                        }}
                        className="px-4 py-3 hover:bg-blue-600/20 cursor-pointer text-sm text-slate-200 border-b border-white/5 flex justify-between items-center"
                      >
                        <span className="font-medium text-white">{s.name}</span>
                        <span className="text-xs text-slate-400 font-mono">{s.email}</span>
                      </div>
                    ))}
                    {students.filter(s => s.name.toLowerCase().includes(analysisSearchQuery.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-sm text-slate-500 text-center">No students found</div>
                    )}
                </div>
              )}
            </div>
          </div>

          {analysisData && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center shadow-lg">
                  <div className="w-20 h-20 mx-auto rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-4">
                    {analysisData.student.name.substring(0, 2).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold text-white">{analysisData.student.name}</h2>
                  <p className="text-sm text-slate-400 mb-4">{analysisData.student.email}</p>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-sm text-slate-400">Attendance</span>
                    <span className={`font-bold ${analysisData.student.attendance >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>{analysisData.student.attendance}%</span>
                  </div>
                  <button 
                    onClick={() => { setSelectedStudentForAnalysis(''); setAnalysisSearchQuery(''); }}
                    className="mt-4 text-xs text-blue-400 hover:underline"
                  >
                    Clear Selection & Search Another
                  </button>
                </div>

                <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-3xl p-6 shadow-lg">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Sparkles size={16} className="text-cyan-400"/> AI Recommendations</h3>
                  <div className="space-y-3">
                    {!analysisData.noData ? analysisData.insights.map((insight, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 text-sm text-slate-300">
                        {insight}
                      </div>
                    )) : <p className="text-sm text-slate-400">Upload marks to generate insights.</p>}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Activity size={20} className="text-indigo-400"/> Academic Profile</h3>
                
                {!analysisData.noData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisData.sMarks.map((m) => (
                      <div key={m.id} className="p-5 rounded-2xl border border-white/10 bg-white/5 flex justify-between items-center hover:border-white/20 transition-all">
                        <div>
                          <p className="text-white font-bold text-lg mb-1">{m.subject}</p>
                          <p className="text-xs text-cyan-400 uppercase tracking-widest">{m.exam_type || 'Exam'}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${m.percentage >= 35 ? 'text-emerald-400' : 'text-red-400'}`}>{m.marks}<span className="text-sm text-slate-500 font-normal">/{m.maxMarks}</span></p>
                          <p className="text-[10px] uppercase text-slate-400 mt-1">{m.gradeInfo.letter} Grade ({m.percentage}%)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-500">
                    <BookOpen size={40} className="mx-auto mb-3 opacity-50"/>
                    <p>No marks data available for this student.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* IMPORT EXCEL MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <button onClick={() => { setIsImportModalOpen(false); setCsvFile(null); }} className="absolute top-6 right-6 text-slate-400 hover:text-white cursor-pointer"><X size={20}/></button>
            
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Import Subject Marksheet</h2>
              <p className="text-xs text-slate-400">Select file. Subject & Exam columns will be created automatically.</p>
            </div>
            
            <div className="border-2 border-dashed border-blue-500/30 rounded-2xl p-6 text-center bg-blue-500/5 relative">
              <input 
                type="file" 
                accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                onChange={(e) => handleFileSelect(e.target.files[0])} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <UploadCloud size={36} className="mx-auto text-blue-400 mb-2" />
              <p className="text-xs text-white font-medium truncate px-2">{csvFile ? csvFile.name : "Select or Drop .xlsx / .csv File"}</p>
            </div>

            {csvFile && (
              <div className="space-y-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Subject Name (Column Label)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. COA, DBMS, Maths, OS..." 
                    value={uploadSubject} 
                    onChange={(e) => setUploadSubject(e.target.value)} 
                    className="w-full bg-[#1e293b] border border-white/10 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-cyan-500" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Exam Type</label>
                  <select 
                    value={uploadExamType} 
                    onChange={(e) => setUploadExamType(e.target.value)} 
                    className="w-full bg-[#1e293b] border border-white/10 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-cyan-500"
                  >
                    <option value="T1">T1 (Test 1 - Out of 25)</option>
                    <option value="T2">T2 (Test 2 - Out of 25)</option>
                    <option value="T3">T3 (Test 3 - Out of 25)</option>
                    <option value="T4">T4 (Final Exam - Out of 50)</option>
                  </select>
                </div>
              </div>
            )}

            <button 
              onClick={async () => {
                if (!csvFile) return alert("Select a file first.");
                setIsUploading(true);
                try {
                  const res = await uploadBulkMarks(csvFile, uploadSubject, uploadExamType);
                  alert(res.message);
                  setIsImportModalOpen(false);
                  setCsvFile(null);
                  loadAllData();
                } catch (err) { 
                  console.error(err);
                  alert("Upload failed. Check console."); 
                } finally { 
                  setIsUploading(false); 
                }
              }} 
              disabled={isUploading || !csvFile} 
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-all disabled:opacity-50 cursor-pointer shadow-lg"
            >
              {isUploading ? "Processing Marksheet..." : "Upload & Save Subject Column"}
            </button>
          </motion.div>
        </div>
      )}

      <FloatingButton />
    </div>
  );
}
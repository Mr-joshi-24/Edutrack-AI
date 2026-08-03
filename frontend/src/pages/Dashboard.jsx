import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, TrendingUp, Award, AlertTriangle, Activity, 
  Search, CheckCircle2, X, Plus 
} from 'lucide-react';

import StatCard from '../components/StatCard';
import FloatingButton from '../components/FloatingButton';
import { fetchStudents, fetchMarks, fetchAtRiskStudents } from '../services/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [atRiskList, setAtRiskList] = useState([]);

  // Multi-student selector for vertical comparison (up to 4 students)
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // 1. Capture OAuth token from URL redirect and clean up the address bar
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');
    
    if (token) {
      localStorage.setItem('authToken', token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Load dashboard telemetry data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [studentsData, marksData, riskData] = await Promise.all([
        fetchStudents().catch(() => []),
        fetchMarks().catch(() => []),
        fetchAtRiskStudents().catch(() => [])
      ]);

      const sortedStudents = (studentsData || []).sort((a, b) => a.name.localeCompare(b.name));
      setStudents(sortedStudents);
      setMarks(marksData || []);
      setAtRiskList(riskData || []);

      // Default select up to the first 3 students for comparison
      if (sortedStudents.length > 0) {
        setSelectedStudentIds(sortedStudents.slice(0, 3).map(s => s.id));
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  // Real Metric Calculations
  const totalStudents = students.length;
  const avgAttendance = totalStudents > 0 
    ? Math.round(students.reduce((acc, curr) => acc + (curr.attendance || 0), 0) / totalStudents) 
    : 0;

  const avgMarksVal = marks.length > 0 
    ? Math.round(marks.reduce((acc, curr) => acc + (Number(curr.marks) || 0), 0) / marks.length) 
    : 0;

  // Handle student toggle selection
  const handleStudentToggle = (id) => {
    if (selectedStudentIds.includes(id)) {
      if (selectedStudentIds.length > 1) {
        setSelectedStudentIds(selectedStudentIds.filter(item => item !== id));
      }
    } else {
      if (selectedStudentIds.length < 4) {
        setSelectedStudentIds([...selectedStudentIds, id]);
        setSearchQuery(''); // clear search on select
      } else {
        alert("You can compare up to 4 students simultaneously.");
      }
    }
  };

  // Filtered students for instant autocomplete suggestions as you type
  const matchingSuggestions = searchQuery.trim() === '' ? [] : students.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) && !selectedStudentIds.includes(s.id)
  );

  // Gather chart datasets for selected students
  const chartDataStudents = selectedStudentIds.map(id => {
    const s = students.find(item => item.id === id);
    const sMarks = marks.filter(m => m.student_id === id);
    const avgScore = sMarks.length > 0 
      ? Math.round(sMarks.reduce((acc, m) => acc + (Number(m.marks) || 0), 0) / sMarks.length) 
      : 0;
    return {
      student: s,
      avgScore,
      attendance: s?.attendance || 0
    };
  });

  return (
    <div className="w-full text-slate-200 space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
          Academic Command Center
        </h1>
        <p className="text-slate-400 text-sm">Real-time telemetry, student risk diagnostics, and performance analytics.</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Students" value={totalStudents} icon={Users} color="text-blue-400" />
        <StatCard title="Avg Attendance" value={`${avgAttendance}%`} ring={avgAttendance} icon={TrendingUp} color="text-emerald-400" />
        <StatCard title="Average Mark" value={`${avgMarksVal} / 25`} icon={Award} color="text-cyan-400" />
        <StatCard title="Students At Risk" value={atRiskList.length} icon={AlertTriangle} color="text-red-400" isDanger={atRiskList.length > 0} />
      </div>

      {/* SECTION 2: VERTICAL PERFORMANCE COMPARISON & AUTOCOMPLETE SELECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* VERTICAL BAR CHART CONTAINER */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={20} className="text-cyan-400" /> Vertical Student Performance Comparison
              </h3>
              <span className="text-xs font-mono text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {selectedStudentIds.length} / 4 Active
              </span>
            </div>
            <p className="text-xs text-slate-400">Comparing side-by-side vertical score and attendance distributions.</p>
          </div>

          {/* VERTICAL COLUMNS TELEMETRY */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 items-end h-[280px] border-b border-white/10 px-2">
            {chartDataStudents.map(({ student, avgScore, attendance }) => {
              if (!student) return null;
              return (
                <div key={student.id} className="flex flex-col items-center h-full justify-end space-y-3 group relative">
                  
                  {/* Values preview tooltip tag */}
                  <div className="text-[10px] font-mono text-center space-y-0.5 bg-[#0a1020] border border-white/10 px-2 py-1.5 rounded-xl shadow-lg w-full">
                    <p className="text-cyan-400 font-bold">{avgScore} marks</p>
                    <p className={attendance >= 75 ? 'text-emerald-400' : 'text-red-400'}>{attendance}% att</p>
                  </div>

                  {/* Vertical Bars Container */}
                  <div className="w-full flex items-end justify-center gap-1.5 h-40 bg-white/5 rounded-2xl p-2 border border-white/5">
                    {/* Score Bar */}
                    <div 
                      className="w-1/2 bg-gradient-to-t from-cyan-600 to-blue-400 rounded-t-lg transition-all duration-700 shadow-[0_0_10px_rgba(6,182,212,0.4)]" 
                      style={{ height: `${Math.max(15, Math.min(100, (avgScore / 25) * 100))}%` }}
                      title={`Exam Score: ${avgScore}/25`}
                    />
                    {/* Attendance Bar */}
                    <div 
                      className={`w-1/2 rounded-t-lg transition-all duration-700 ${attendance >= 75 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-gradient-to-t from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`} 
                      style={{ height: `${Math.max(15, Math.min(100, attendance))}%` }}
                      title={`Attendance: ${attendance}%`}
                    />
                  </div>

                  {/* Student Name & Remove Action */}
                  <div className="text-center w-full">
                    <p className="text-xs font-bold text-white truncate px-1">{student.name.split(' ')[0]}</p>
                    <button 
                      onClick={() => handleStudentToggle(student.id)} 
                      className="text-[10px] text-slate-500 hover:text-red-400 transition-colors mt-0.5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PREDICTIVE SEARCH AUTOCOMPLETE PANEL */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4 flex flex-col relative">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Add Student to Graph</h3>
            <p className="text-xs text-slate-400">Type letters below for instant suggestions.</p>
          </div>

          {/* Instant Autocomplete Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Type student name (e.g. A)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b] border border-white/10 text-xs text-white rounded-xl pl-10 pr-4 py-3 outline-none focus:border-cyan-500 transition-all shadow-inner"
            />

            {/* Suggestions Dropdown */}
            {matchingSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-[#0a1020] border border-white/10 rounded-2xl shadow-2xl max-h-56 overflow-y-auto z-30 divide-y divide-white/5">
                {matchingSuggestions.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => handleStudentToggle(s.id)}
                    className="p-3 hover:bg-cyan-500/20 cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{s.email || `ID: ${s.id}`}</p>
                    </div>
                    <span className="p-1 rounded-full bg-white/5 text-cyan-400"><Plus size={14}/></span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 pt-2">
            Currently active comparison targets: <span className="text-white font-mono">{selectedStudentIds.length} / 4</span>
          </div>

          <div className="space-y-2 mt-auto pt-4 border-t border-white/5">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Quick Selected List</p>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
              {selectedStudentIds.map(id => {
                const s = students.find(item => item.id === id);
                if (!s) return null;
                return (
                  <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {s.name}
                    <button onClick={() => handleStudentToggle(id)} className="hover:text-white"><X size={12}/></button>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: RECOMMENDED ATTENTION (HIGHEST RISK STUDENTS) */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-400" /> Recommended Attention (Highest Risk Students)
            </h3>
            <p className="text-xs text-slate-400">Students flagged automatically due to low attendance (&lt;75%) or critical grade dips.</p>
          </div>
          <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-bold text-red-400">
            {atRiskList.length} Flagged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {atRiskList.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-400 opacity-80" />
              <p className="text-sm font-medium text-white">No students currently at risk!</p>
            </div>
          ) : (
            atRiskList.slice(0, 6).map((riskItem, idx) => (
              <div key={idx} className="bg-[#0a1020] border border-red-500/20 rounded-2xl p-5 space-y-3 hover:border-red-500/40 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-base">{riskItem.name}</h4>
                    <p className="text-xs font-mono text-slate-400">Student ID: #{riskItem.student_id}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                    High Risk
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/5 text-xs">
                  <span className="text-slate-400">Attendance Rate:</span>
                  <span className="font-bold text-red-400">{riskItem.attendance ?? 0}%</span>
                </div>

                <div className="p-2.5 bg-red-500/5 rounded-xl border border-red-500/10 text-[11px] text-red-200/80">
                  ⚠️ Requires immediate faculty counseling and remedial tracking.
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <FloatingButton />
    </div>
  );
}
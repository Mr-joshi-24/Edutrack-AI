import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Target, Sparkles, AlertCircle, Award, TrendingUp } from 'lucide-react';

export default function CgpaSimulator({ students = [], marks = [] }) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [currentAvgMarks, setCurrentAvgMarks] = useState(18); // out of 25 default
  const [currentAttendance, setCurrentAttendance] = useState(82);
  const [targetCgpa, setTargetCgpa] = useState(8.5);
  const [examMaxMarks, setExamMaxMarks] = useState(50); // T4 final exam out of 50

  // Handle auto-populating student data when a student is selected from dropdown
  const handleStudentSelect = (e) => {
    const id = e.target.value;
    setSelectedStudentId(id);
    if (!id) return;

    const student = students.find(s => s.id === parseInt(id));
    if (student) {
      if (student.attendance) setCurrentAttendance(Math.round(student.attendance));
      
      const studentMarks = marks.filter(m => m.student_id === parseInt(id));
      if (studentMarks.length > 0) {
        const validMarks = studentMarks.map(m => m.marks).filter(m => m !== null);
        if (validMarks.length > 0) {
          const avg = validMarks.reduce((a, b) => a + b, 0) / validMarks.length;
          setCurrentAvgMarks(Math.round(avg));
        }
      }
    }
  };

  // Calculation Logic
  // Convert CGPA (out of 10) to percentage equivalent approx (CGPA * 9.5)
  const targetPercentage = Math.min(100, targetCgpa * 9.5);
  
  // Current internal weightage score (assume current avg represents 40% weightage, T4 represents 60%)
  const currentPercentage = (currentAvgMarks / 25) * 100;
  
  // Needed percentage in final exam (T4) to hit overall target
  // Overall % = (0.4 * current%) + (0.6 * neededT4%)
  // => neededT4% = (targetPercentage - 0.4 * current%) / 0.6
  const neededT4Percentage = Math.max(0, (targetPercentage - (0.4 * currentPercentage)) / 0.6);
  const requiredScore = Math.min(examMaxMarks, Math.max(0, Math.round((neededT4Percentage / 100) * examMaxMarks)));

  // Feasibility tier
  let feasibility = { label: 'Easily Achievable', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  if (requiredScore > examMaxMarks * 0.9) {
    feasibility = { label: 'High Effort Required (Near Max Score)', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
  } else if (requiredScore > examMaxMarks * 0.75) {
    feasibility = { label: 'Challenging (Consistent Prep Needed)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  } else if (requiredScore > examMaxMarks * 0.5) {
    feasibility = { label: 'Moderate Effort Required', color: 'text-cyan-400 bg-[#0a1020] border-cyan-500/20' };
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Fraunces', serif" }}>
            <Calculator className="text-cyan-400" size={24} /> CGPA & Target Exam Simulator
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulate required T4 / End-Sem exam scores to reach target CGPA goals.
          </p>
        </div>

        {/* Student Selector */}
        {students.length > 0 && (
          <select
            value={selectedStudentId}
            onChange={handleStudentSelect}
            className="bg-[#1e293b] border border-white/10 text-xs text-white rounded-xl px-4 py-2.5 outline-none focus:border-cyan-500 transition-all cursor-pointer"
          >
            <option value="">-- Autofill from Student --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} (ID: #{s.id})</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* INPUT SLIDERS PANEL */}
        <div className="space-y-5">
          
          {/* Target CGPA Slider */}
          <div className="space-y-2 bg-[#0a1020] p-4 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Target size={15} className="text-cyan-400" /> Target CGPA Goal:
              </span>
              <span className="font-bold text-cyan-400 text-sm font-mono">{targetCgpa} / 10.0</span>
            </div>
            <input 
              type="range" 
              min="5.0" 
              max="10.0" 
              step="0.1"
              value={targetCgpa}
              onChange={(e) => setTargetCgpa(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>5.0 (Pass)</span>
              <span>7.5 (Good)</span>
              <span>9.0+ (Honors)</span>
            </div>
          </div>

          {/* Current Average Internal Score Slider */}
          <div className="space-y-2 bg-[#0a1020] p-4 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Award size={15} className="text-blue-400" /> Current Avg Internals (T1-T3):
              </span>
              <span className="font-bold text-blue-400 text-sm font-mono">{currentAvgMarks} / 25</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="25" 
              step="1"
              value={currentAvgMarks}
              onChange={(e) => setCurrentAvgMarks(parseInt(e.target.value))}
              className="w-full accent-blue-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
            />
          </div>

          {/* Current Attendance Slider */}
          <div className="space-y-2 bg-[#0a1020] p-4 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <TrendingUp size={15} className="text-emerald-400" /> Current Attendance Rate:
              </span>
              <span className={`font-bold text-sm font-mono ${currentAttendance >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>
                {currentAttendance}%
              </span>
            </div>
            <input 
              type="range" 
              min="30" 
              max="100" 
              step="1"
              value={currentAttendance}
              onChange={(e) => setCurrentAttendance(parseInt(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
            />
          </div>

        </div>

        {/* OUTPUT RESULTS CARD */}
        <div className="bg-[#0a1020] border border-cyan-500/20 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles size={120} className="text-cyan-400" />
          </div>

          <div className="space-y-4">
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs font-bold text-cyan-300 inline-flex items-center gap-1.5">
              <Sparkles size={14} /> AI Target Simulation Result
            </span>

            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Required T4 Score Needed</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl lg:text-5xl font-extrabold text-white font-mono">
                  {requiredScore}
                </span>
                <span className="text-slate-400 text-lg font-mono">/ {examMaxMarks} marks</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Equivalent to <span className="text-cyan-400 font-bold font-mono">{neededT4Percentage.toFixed(1)}%</span> in final exam.
              </p>
            </div>

            {/* Feasibility Tag */}
            <div className="pt-2">
              <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-bold border ${feasibility.color}`}>
                {feasibility.label}
              </span>
            </div>
          </div>

          {/* Detailed Context Box */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Target Percentage Equivalent:</span>
              <span className="font-mono text-white font-bold">{targetPercentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Attendance Status:</span>
              <span className={currentAttendance >= 75 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                {currentAttendance >= 75 ? 'Eligible (>= 75%)' : 'Needs De-barment Clearance'}
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

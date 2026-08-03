import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, AlertTriangle, CheckCircle, Mail, BookOpen } from 'lucide-react';
import { fetchStudents, fetchAtRiskStudents } from '../services/api';
import StatCard from '../components/StatCard';
import FloatingButton from '../components/FloatingButton';

export default function Students() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [riskStudents, setRiskStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const [studentsData, riskData] = await Promise.all([
        fetchStudents().catch(() => []),
        fetchAtRiskStudents().catch(() => [])
      ]);
      
      // Sort alphabetically by name for a clean layout
      setStudents((studentsData || []).sort((a, b) => a.name.localeCompare(b.name)));
      setRiskStudents(riskData || []);
    } catch (err) {
      console.error("Failed to load student records", err);
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = students.length;
  const safeStudents = students.filter(s => (s.attendance || 0) >= 75).length;
  const defaultersCount = students.filter(s => (s.attendance || 0) < 75).length;
  const avgAttendance = totalStudents > 0 
    ? Math.round(students.reduce((acc, curr) => acc + (curr.attendance || 0), 0) / totalStudents) 
    : 0;

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full text-slate-200 space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Student Directory</h1>
        <p className="text-slate-400 text-sm">Managing records, active branch details, roll numbers, and attendance metrics parsed from CSV & PDFs.</p>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Students" value={totalStudents} icon={Users} color="text-blue-400" />
        <StatCard title="Average Attendance" value={`${avgAttendance}%`} ring={avgAttendance} />
        <StatCard title="Safe Status (>=75%)" value={safeStudents} icon={CheckCircle} color="text-emerald-400" />
        <StatCard title="Defaulters (<75%)" value={defaultersCount} icon={AlertTriangle} color="text-red-400" isDanger={defaultersCount > 0} />
      </div>

      {/* SEARCH & CLEAN TABLE CONTAINER */}
      <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-lg overflow-hidden space-y-4 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search student by name or email..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full bg-[#0a1020] border border-white/10 text-sm text-white rounded-full pl-11 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-all" 
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">Profile</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Roll No</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4 rounded-tr-xl">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-12 text-slate-500">Loading student directory...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-12 text-slate-500">No student records found.</td></tr>
              ) : (
                filteredStudents.map((student) => {
                  const initials = student.name ? student.name.substring(0, 2).toUpperCase() : "ST";
                  const att = student.attendance !== undefined && student.attendance !== null ? student.attendance : 0;
                  const isSafe = att >= 75;
                  
                  return (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                      {/* 1. Profile */}
                      <td className="px-6 py-4">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-lg">
                          {initials}
                        </div>
                      </td>

                      {/* 2. Student Name & Email */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-white capitalize">{student.name}</p>
                        <p className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Mail size={12} className="opacity-70" /> {student.email || 'No email provided'}
                        </p>
                      </td>

                      {/* 3. Roll No */}
                      <td className="px-6 py-4 text-slate-300 font-mono">
                        {student.roll_no || student.enrollment_no || `#${student.id}`}
                      </td>

                      {/* 4. Branch */}
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {student.branch || 'CSE'}
                        </span>
                      </td>

                      {/* 5. Attendance */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`text-base font-bold ${isSafe ? 'text-emerald-400' : 'text-red-400'}`}>
                            {att}%
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold ${isSafe ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {isSafe ? 'Safe' : 'Defaulter'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FloatingButton />
    </div>
  );
}
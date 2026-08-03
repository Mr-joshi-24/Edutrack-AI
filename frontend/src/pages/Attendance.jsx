import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, CheckCircle, AlertTriangle, Search, 
  UploadCloud, Plus, X, FileText, Check 
} from 'lucide-react';
import { 
  fetchStudents, fetchAttendance, submitAttendance, 
  uploadBulkAttendance, uploadAttendancePdf 
} from '../services/api';
import StatCard from '../components/StatCard';
import FloatingButton from '../components/FloatingButton';

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState(["General", "DSA", "DBMS", "Operating Systems"]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false); // NEW PDF Modal State
  
  // Form States
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [markSubject, setMarkSubject] = useState("General");
  const [markStatus, setMarkStatus] = useState("Present");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CSV Upload States
  const [csvFile, setCsvFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // PDF Upload States
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfSubject, setPdfSubject] = useState("General");
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, attendanceData] = await Promise.all([
        fetchStudents().catch(() => []),
        fetchAttendance().catch(() => []) 
      ]);
      
      setStudents(studentsData.sort((a, b) => a.name.localeCompare(b.name)));

      if (attendanceData && attendanceData.length > 0) {
        const uniqueSubjects = [...new Set(attendanceData.map(a => a.subject).filter(Boolean))];
        if (uniqueSubjects.length > 0) {
          setAvailableSubjects(uniqueSubjects);
          setMarkSubject(uniqueSubjects[0]); 
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) return alert("Please select a student");
    if (!markSubject) return alert("Please select a subject");
    
    try {
      setIsSubmitting(true);
      await submitAttendance({
        student_id: parseInt(selectedStudentId),
        date: markDate,
        subject: markSubject,
        status: markStatus
      });
      setIsMarkModalOpen(false);
      loadData(); 
    } catch (error) {
      alert("Error saving attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!csvFile) return alert("Please select a CSV file first.");
    setIsUploading(true);
    try {
      await uploadBulkAttendance(csvFile);
      setIsImportModalOpen(false);
      setCsvFile(null);
      loadData(); 
    } catch (err) {
      alert("Upload failed. Ensure CSV has correct columns (email, subject, attendance).");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return alert("Please select a PDF file first.");
    setIsPdfUploading(true);
    setPdfSuccessMessage("");
    try {
      const res = await uploadAttendancePdf(pdfFile, pdfSubject);
      setPdfSuccessMessage(res.message || "Successfully processed PDF attendance!");
      setPdfFile(null);
      loadData(); // Refresh tables and percentages
    } catch (err) {
      alert("PDF attendance import failed. Check console for details.");
    } finally {
      setIsPdfUploading(false);
    }
  };

  // Analytics Calculations
  const totalStudents = students.length;
  const safeStudents = students.filter(s => (s.attendance || 0) >= 75).length;
  const riskStudents = students.filter(s => (s.attendance || 0) < 75).length;
  const avgAttendance = totalStudents > 0 
    ? Math.round(students.reduce((acc, curr) => acc + (curr.attendance || 0), 0) / totalStudents) 
    : 0;

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full text-slate-200 space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Student Attendance</h1>
          <p className="text-slate-400 text-sm">Manage weekly bulk reports, PDF marksheets, and individual records.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setIsPdfModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-sm font-medium text-emerald-300">
            <FileText size={16} /> Import PDF Marksheet
          </button>
          <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium text-white">
            <UploadCloud size={16} className="text-cyan-400"/> Bulk Import (CSV)
          </button>
          <button onClick={() => setIsMarkModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 transition-all text-white text-sm font-medium shadow-lg">
            <Plus size={16} /> Mark Manually
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Students" value={totalStudents} icon={Users} color="text-blue-400" />
        <StatCard title="Average Attendance" value={`${avgAttendance}%`} ring={avgAttendance} />
        <StatCard title="Safe (>75%)" value={safeStudents} icon={CheckCircle} color="text-emerald-400" />
        <StatCard title="Defaulters (<75%)" value={riskStudents} icon={AlertTriangle} color="text-red-400" isDanger={riskStudents > 0} />
      </div>

      {/* SEARCH & TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-lg overflow-hidden space-y-4 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search student name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#0a1020] border border-white/10 text-sm text-white rounded-full pl-11 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-all" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">Student</th>
                <th className="px-6 py-4">ID / Email</th>
                <th className="px-6 py-4 text-center">Current Attendance</th>
                <th className="px-6 py-4 rounded-tr-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-8 text-slate-500">Loading records...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-slate-500">No records found.</td></tr>
              ) : (
                filteredStudents.map((student) => {
                  const att = student.attendance || 0;
                  const isSafe = att >= 75;
                  return (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white capitalize flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">{student.name.substring(0,2).toUpperCase()}</div>
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{student.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-base font-bold ${isSafe ? 'text-emerald-400' : 'text-red-400'}`}>{att}%</span>
                      </td>
                      <td className="px-6 py-4">
                        {isSafe ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Safe</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Defaulter</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANUAL MARK MODAL */}
      {isMarkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl">
            <button onClick={() => setIsMarkModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X size={20}/></button>
            <h2 className="text-xl font-bold text-white mb-6">Mark Attendance</h2>
            
            <form onSubmit={handleMarkAttendance} className="space-y-5">
              <div>
                <label className="block text-xs text-slate-400 uppercase font-medium mb-1.5">Date</label>
                <input type="date" required value={markDate} onChange={(e) => setMarkDate(e.target.value)} className="w-full bg-[#1e293b] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
              </div>
              
              <div>
                <label className="block text-xs text-slate-400 uppercase font-medium mb-1.5">Student</label>
                <select required value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full bg-[#1e293b] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500">
                  <option value="">Select Student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 uppercase font-medium mb-2">Subject</label>
                <div className="flex flex-wrap gap-2">
                  {availableSubjects.map((sub) => (
                    <label 
                      key={sub} 
                      className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-all ${
                        markSubject === sub 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="subject" 
                        value={sub} 
                        checked={markSubject === sub} 
                        onChange={(e) => setMarkSubject(e.target.value)} 
                        className="hidden" 
                      />
                      {sub}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 uppercase font-medium mb-1.5">Status</label>
                <select value={markStatus} onChange={(e) => setMarkStatus(e.target.value)} className="w-full bg-[#1e293b] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500">
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full mt-4 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-lg disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Save Record"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WEEKLY CSV BULK IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={() => { setIsImportModalOpen(false); setCsvFile(null); }} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X size={20}/></button>
            <h2 className="text-xl font-bold text-white mb-2">Weekly Bulk Import (CSV)</h2>
            <p className="text-xs text-slate-400 mb-6">Upload a CSV file containing student emails and attendance records.</p>
            
            <div className="border-2 border-dashed border-blue-500/30 rounded-2xl p-8 text-center bg-blue-500/5 relative mb-6">
              <input 
                type="file" 
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud size={40} className="mx-auto text-blue-400 mb-3" />
              <p className="text-sm text-white font-medium">
                {csvFile ? csvFile.name : "Select or Drop CSV File"}
              </p>
              <p className="text-[10px] text-slate-500 mt-2">Required Columns: email, subject, attendance (Present/Absent)</p>
            </div>

            <button 
              onClick={handleBulkUpload} 
              disabled={isUploading || !csvFile}
              className="w-full py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Upload & Update Database"}
            </button>
          </div>
        </div>
      )}

      {/* WEEKLY PDF ATTENDANCE UPLOAD MODAL */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={() => { setIsPdfModalOpen(false); setPdfFile(null); setPdfSuccessMessage(""); }} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X size={20}/></button>
            <h2 className="text-xl font-bold text-white mb-2">Import PDF Marksheet/Attendance</h2>
            <p className="text-xs text-slate-400 mb-6">Upload a weekly compiled PDF sheet to automatically log attendance and update percentages.</p>
            
            {pdfSuccessMessage && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 mb-6">
                <Check className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-emerald-200">{pdfSuccessMessage}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs text-slate-400 uppercase font-medium mb-1.5">Target Subject</label>
                <input 
                  type="text" 
                  value={pdfSubject} 
                  onChange={(e) => setPdfSubject(e.target.value)} 
                  placeholder="e.g. COA, DSA" 
                  className="w-full bg-[#1e293b] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-sm" 
                />
              </div>

              <div className="border-2 border-dashed border-emerald-500/30 rounded-2xl p-8 text-center bg-emerald-500/5 relative">
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileText size={40} className="mx-auto text-emerald-400 mb-3" />
                <p className="text-sm text-white font-medium">
                  {pdfFile ? pdfFile.name : "Select or Drop PDF File"}
                </p>
                <p className="text-[10px] text-slate-500 mt-2">Scans text for student names/emails & extracts attendance status</p>
              </div>
            </div>

            <button 
              onClick={handlePdfUpload} 
              disabled={isPdfUploading || !pdfFile}
              className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all shadow-lg disabled:opacity-50"
            >
              {isPdfUploading ? "Parsing PDF Content..." : "Process & Update Attendance"}
            </button>
          </div>
        </div>
      )}

      <FloatingButton />
    </div>
  );
}
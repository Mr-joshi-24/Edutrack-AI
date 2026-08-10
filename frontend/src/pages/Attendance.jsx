import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle, AlertTriangle, Search, 
  UploadCloud, Plus, X, FileText, Check, Download, Calendar, UserCheck, UserX
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { 
  fetchStudents, fetchAttendance, submitBulkAttendance, 
  uploadBulkAttendance, uploadAttendancePdf 
} from '../services/api';
import StatCard from '../components/StatCard';
import FloatingButton from '../components/FloatingButton';

const FIXED_SUBJECTS = ["COA", "TOC", "DM", "FCSP-2", "FSD-2"];

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  
  // Sticky Persistent Form States (Saved in localStorage)
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [markSubject, setMarkSubject] = useState(() => localStorage.getItem("edutrack_sticky_subject") || "COA");
  const [markStatus, setMarkStatus] = useState(() => localStorage.getItem("edutrack_sticky_status") || "Absent");
  
  // Searchable Multi-Select Student State
  const [selectedStudentsList, setSelectedStudentsList] = useState([]);
  const [searchStudentQuery, setSearchStudentQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CSV Upload States
  const [csvFile, setCsvFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // PDF Upload States
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfSubject, setPdfSubject] = useState("COA");
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const handleSubjectChange = (sub) => {
    setMarkSubject(sub);
    localStorage.setItem("edutrack_sticky_subject", sub);
  };

  const handleStatusChange = (status) => {
    setMarkStatus(status);
    localStorage.setItem("edutrack_sticky_status", status);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData] = await Promise.all([
        fetchStudents().catch(() => [])
      ]);
      setStudents(studentsData.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Multi-Student Selection
  const handleAddStudentToSelection = (student) => {
    if (!selectedStudentsList.some(s => s.id === student.id)) {
      setSelectedStudentsList([...selectedStudentsList, student]);
    }
    setSearchStudentQuery("");
  };

  const handleRemoveStudentFromSelection = (studentId) => {
    setSelectedStudentsList(selectedStudentsList.filter(s => s.id !== studentId));
  };

  // 1-CLICK BULK SUBMISSION LOGIC (Applies across all students)
  const handleBulkSubmitAttendance = async (e) => {
    if (e) e.preventDefault();
    if (students.length === 0) return alert("No students found in the database!");

    const selectedIds = new Set(selectedStudentsList.map(s => s.id));
    const oppositeStatus = markStatus === "Absent" ? "Present" : "Absent";

    const records = students.map(s => ({
      student_id: s.id,
      date: markDate,
      subject: markSubject,
      status: selectedIds.has(s.id) ? markStatus : oppositeStatus
    }));

    try {
      setIsSubmitting(true);
      await submitBulkAttendance(records);
      alert(`Successfully marked attendance for ${students.length} students! (${selectedStudentsList.length} ${markStatus}, ${students.length - selectedStudentsList.length} ${oppositeStatus})`);
      setIsMarkModalOpen(false);
      setSelectedStudentsList([]);
      loadData();
    } catch (error) {
      console.error(error);
      alert("Error saving bulk attendance records");
    } finally {
      setIsSubmitting(false);
    }
  };

  // GENERATE & DOWNLOAD ABSENTEE STATEMENT PDF (NO EMAIL COLUMN)
  const downloadAbsenteePdf = () => {
    const selectedIds = new Set(selectedStudentsList.map(s => s.id));

    let absentStudents = [];
    if (markStatus === "Absent") {
      absentStudents = selectedStudentsList;
    } else {
      absentStudents = students.filter(s => !selectedIds.has(s.id));
    }

    const doc = new jsPDF();
    
    // Header Banner
    doc.setFillColor(15, 23, 42); // Dark slate
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("DEPARTMENT OF COMPUTER ENGINEERING", 14, 16);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(56, 189, 248); // Cyan
    doc.text(`OFFICIAL CLASS ABSENTEE STATEMENT`, 14, 26);

    // Summary Box
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Date of Class: ${markDate}`, 14, 44);
    doc.text(`Subject Code: ${markSubject}`, 80, 44);
    doc.text(`Total Class Strength: ${students.length}`, 14, 50);
    doc.text(`Absentees Recorded: ${absentStudents.length}`, 80, 50);
    doc.text(`Class Present Rate: ${students.length > 0 ? Math.round(((students.length - absentStudents.length) / students.length) * 100) : 100}%`, 145, 50);

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 54, 196, 54);

    // Table Header Row (NO EMAIL COLUMN)
    let y = 64;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y - 5, 182, 8, 'F');
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("#", 18, y);
    doc.text("Roll / ID", 35, y);
    doc.text("Student Name", 90, y);
    doc.text("Status", 175, y);

    // Table Data Rows
    y += 8;
    doc.setFont("helvetica", "normal");
    
    if (absentStudents.length === 0) {
      doc.setTextColor(16, 185, 129);
      doc.text("No absentees reported! 100% attendance recorded for this session.", 18, y);
    } else {
      absentStudents.forEach((student, idx) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setTextColor(51, 65, 85);
        doc.text(`${idx + 1}`, 18, y);
        doc.text(`${student.roll_no || student.enrollment_no || '#' + student.id}`, 35, y);
        doc.text(`${student.name}`, 90, y);
        
        doc.setTextColor(225, 29, 72);
        doc.setFont("helvetica", "bold");
        doc.text("ABSENT", 175, y);
        doc.setFont("helvetica", "normal");

        y += 7;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated automatically via EduTrack AI Command Center on ${new Date().toLocaleString()}`, 14, 288);

    doc.save(`Absentee_Notice_${markSubject}_${markDate}.pdf`);
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
      alert("Upload failed. Ensure CSV has correct columns.");
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
      loadData();
    } catch (err) {
      alert("PDF attendance import failed.");
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

  const autocompleteSuggestions = searchStudentQuery.trim() === "" ? [] : students.filter(s =>
    s.name.toLowerCase().includes(searchStudentQuery.toLowerCase()) &&
    !selectedStudentsList.some(sel => sel.id === s.id)
  );

  return (
    <div className="w-full text-slate-200 space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Student Attendance</h1>
          <p className="text-slate-400 text-sm">Manage weekly bulk reports, PDF marksheets, and class attendance.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setIsPdfModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-sm font-medium text-emerald-300 cursor-pointer">
            <FileText size={16} /> Import PDF Marksheet
          </button>
          <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium text-white cursor-pointer">
            <UploadCloud size={16} className="text-cyan-400"/> Bulk Import (CSV)
          </button>
          <button onClick={() => setIsMarkModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 transition-all text-white text-sm font-medium shadow-lg cursor-pointer">
            <Plus size={16} /> Mark Attendance Manually
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0a1020] border border-cyan-500/30 rounded-3xl w-full max-w-xl p-6 sm:p-8 relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsMarkModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white cursor-pointer"><X size={20}/></button>
            
            <div>
              <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                Class Attendance Manager
              </h2>
              <p className="text-xs text-slate-400">
                Mark class attendance in a single click. Pre-selected subject and status remain saved.
              </p>
            </div>
            
            <form onSubmit={handleBulkSubmitAttendance} className="space-y-5">
              
              {/* CLASS DATE SELECTOR */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-cyan-400" /> Class Date
                </label>
                <input 
                  type="date" 
                  required 
                  value={markDate} 
                  onChange={(e) => setMarkDate(e.target.value)} 
                  className="w-full bg-[#1e293b] border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs outline-none focus:border-cyan-500" 
                />
              </div>

              {/* SUBJECT SELECTOR (PERSISTENT COA DEFAULT) */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Subject (Persistent Pre-selection)
                </label>
                <div className="flex flex-wrap gap-2">
                  {FIXED_SUBJECTS.map((sub) => (
                    <button
                      type="button"
                      key={sub} 
                      onClick={() => handleSubjectChange(sub)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        markSubject === sub 
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]' 
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              {/* STATUS SELECTOR (PERSISTENT ABSENT DEFAULT) */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Primary Selection Mode (Default: Absent)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleStatusChange("Absent")}
                    className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                      markStatus === "Absent"
                        ? 'bg-red-500/20 border-red-500 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <UserX size={16} /> Mark Selected as ABSENT (Auto-Present Rest)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange("Present")}
                    className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                      markStatus === "Present"
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <UserCheck size={16} /> Mark Selected as PRESENT (Auto-Absent Rest)
                  </button>
                </div>
              </div>

              {/* SEARCHABLE MULTI-SELECT STUDENT INPUT & REMOVABLE CHIPS */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Search & Select {markStatus} Students ({selectedStudentsList.length} Selected)
                </label>
                
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search student name..." 
                    value={searchStudentQuery}
                    onChange={(e) => setSearchStudentQuery(e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 text-xs text-white rounded-xl pl-10 pr-4 py-3 outline-none focus:border-cyan-500 shadow-inner"
                  />

                  {/* AUTOCOMPLETE DROPDOWN SUGGESTIONS */}
                  {autocompleteSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl max-h-48 overflow-y-auto z-30 divide-y divide-white/5">
                      {autocompleteSuggestions.map(s => (
                        <div 
                          key={s.id}
                          onClick={() => handleAddStudentToSelection(s)}
                          className="p-3 hover:bg-cyan-500/20 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{s.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{s.email || `#${s.id}`}</p>
                          </div>
                          <span className="p-1 rounded-full bg-cyan-500/20 text-cyan-400"><Plus size={14}/></span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SELECTED REMOVABLE CHIPS / BADGES */}
                {selectedStudentsList.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">Selected {markStatus} Students List:</p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto no-scrollbar p-2 bg-white/5 rounded-2xl border border-white/5">
                      {selectedStudentsList.map(s => (
                        <span 
                          key={s.id} 
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm"
                        >
                          {s.name}
                          <button 
                            type="button"
                            onClick={() => handleRemoveStudentFromSelection(s.id)} 
                            className="hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <X size={12}/>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION FOOTER BUTTONS */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3 justify-between items-center">
                <button
                  type="button"
                  onClick={downloadAbsenteePdf}
                  className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={16} className="text-cyan-400" /> Download Absentee PDF
                </button>

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Saving Attendance..." : "Save & Apply Attendance"}
                </button>
              </div>

            </form>
          </motion.div>
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
                  placeholder="e.g. COA, TOC" 
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

      <FloatingButton 
        actions={[
          { label: "Mark Attendance Manually", icon: Plus, onClick: () => setIsMarkModalOpen(true) },
          { label: "Import PDF Marksheet", icon: FileText, onClick: () => setIsPdfModalOpen(true) },
          { label: "Bulk Import (CSV)", icon: UploadCloud, onClick: () => setIsImportModalOpen(true) }
        ]} 
      />
    </div>
  );
}
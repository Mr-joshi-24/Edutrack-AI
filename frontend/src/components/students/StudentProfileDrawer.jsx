import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, ClipboardCheck, BookOpen, FileBarChart } from "lucide-react";
import { Link } from "react-router-dom";
import StudentAvatar from "./StudentAvatar";
import RiskBadge from "./RiskBadge";

export default function StudentProfileDrawer({ open, student, onClose, onEdit }) {
  return (
    <AnimatePresence>
      {open && student && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0a1020]/90 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.5)] overflow-y-auto"
          >
            <div className="sticky top-0 flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5 backdrop-blur-xl z-10">
              <h2
                className="text-lg font-semibold text-white tracking-wide"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Student Profile
              </h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Header Info */}
              <div className="flex items-center gap-4">
                <StudentAvatar name={student.name} photoUrl={student.photoUrl} size={64} />
                <div>
                  <p className="text-xl font-semibold text-white capitalize">{student.name}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{student.rollNumber}</p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm bg-white/5 border border-white/10 rounded-2xl p-5">
                <InfoRow label="Email" value={student.email} />
                <InfoRow label="Phone" value={student.phone} />
                <InfoRow label="Parent Number" value={student.parentPhone} />
                <InfoRow label="Locality" value={student.locality} />
                <InfoRow label="Course" value={student.course} />
                <InfoRow label="Branch" value={student.branch} />
                <InfoRow label="Semester" value={student.semester} />
              </div>

              {/* Academic Overview */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">
                  Academic Overview
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <StatBox label="Attendance" value={student.attendance} suffix="%" />
                  <StatBox label="Average Marks" value={student.averageMarks} suffix="%" />
                  <StatBox label="Class Rank" value={student.classRank} prefix="#" />
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-center items-start">
                    <span className="text-[11px] text-slate-400 mb-2 uppercase tracking-wider">Risk Status</span>
                    <RiskBadge risk={student.riskLevel} />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onEdit(student)}
                    className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all"
                  >
                    <Pencil size={16} /> Edit Student
                  </button>
                  <Link
                    to="/attendance"
                    className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <ClipboardCheck size={16} /> Attendance
                  </Link>
                  <Link
                    to="/marks"
                    className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <BookOpen size={16} /> View Marks
                  </Link>
                  <Link
                    to="/reports"
                    className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <FileBarChart size={16} /> View Report
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Internal component for info text
function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white font-medium">{value ?? "—"}</p>
    </div>
  );
}

// Internal component for the stat boxes
function StatBox({ label, value, prefix = "", suffix = "" }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {typeof value === "number" ? `${prefix}${value}${suffix}` : "—"}
      </p>
    </div>
  );
}
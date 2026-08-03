import { motion } from "framer-motion";
import { Eye, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import StudentAvatar from "./StudentAvatar";
import StatusBadge from "./StatusBadge";
import RiskBadge from "./RiskBadge";

const SORTABLE = [
  { key: "name", label: "Student Name" },
  { key: "rollNumber", label: "Roll Number" },
  { key: "attendance", label: "Attendance" },
  { key: "averageMarks", label: "Average Marks" },
];

export default function StudentTable({
  students,
  sortBy,
  sortOrder,
  onSort,
  onView,
  onEdit,
  onDelete,
}) {
  const SortHeader = ({ field, children }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
    >
      {children}
      {sortBy === field &&
        (sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
    </button>
  );

  return (
    <div className="relative bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-lg overflow-hidden w-full">
      {/* Subtle top glare */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Desktop / tablet: horizontally scrollable table */}
      <div className="hidden md:block overflow-x-auto p-1">
        <table className="w-full text-sm min-w-[1100px] text-left">
          <thead className="bg-white/5 text-slate-400 uppercase text-xs font-semibold tracking-wider">
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 rounded-tl-2xl">Profile</th>
              <th className="px-6 py-4"><SortHeader field="name">Student Name</SortHeader></th>
              <th className="px-6 py-4"><SortHeader field="rollNumber">Roll Number</SortHeader></th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Parent Number</th>
              <th className="px-6 py-4">Locality</th>
              <th className="px-6 py-4">Course/Branch</th>
              <th className="px-6 py-4">Semester</th>
              <th className="px-6 py-4"><SortHeader field="attendance">Attendance</SortHeader></th>
              <th className="px-6 py-4"><SortHeader field="averageMarks">Avg. Marks</SortHeader></th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 rounded-tr-2xl text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {students.map((s, i) => (
              <motion.tr
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.02 }}
                className="hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-4">
                  <button onClick={() => onView(s)}>
                    <StudentAvatar name={s.name} photoUrl={s.photoUrl} />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onView(s)}
                    className="font-medium text-white hover:text-blue-400 capitalize transition-colors text-left"
                  >
                    {s.name}
                  </button>
                </td>
                <td className="px-6 py-4 text-slate-300">{s.rollNumber}</td>
                <td className="px-6 py-4 text-slate-400">{s.email}</td>
                <td className="px-6 py-4 text-slate-400">{s.phone}</td>
                <td className="px-6 py-4 text-slate-400">{s.parentPhone ?? "—"}</td>
                <td className="px-6 py-4 text-slate-400">{s.locality ?? "—"}</td>
                <td className="px-6 py-4 text-slate-400">
                  {s.course ?? "—"}
                  {s.branch ? ` / ${s.branch}` : ""}
                </td>
                <td className="px-6 py-4 text-slate-400">{s.semester ?? "—"}</td>
                <td className="px-6 py-4 text-white font-medium">
                  {typeof s.attendance === "number" ? `${s.attendance}%` : "—"}
                </td>
                <td className="px-6 py-4 text-white font-medium">
                  {typeof s.averageMarks === "number" ? `${s.averageMarks}%` : "—"}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={s.performanceStatus} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3 text-slate-400">
                    <button onClick={() => onView(s)} className="hover:text-blue-400 transition-colors" aria-label="View">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => onEdit(s)} className="hover:text-blue-400 transition-colors" aria-label="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => onDelete(s)} className="hover:text-red-400 transition-colors" aria-label="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden divide-y divide-white/5">
        {students.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.02 }}
            className="p-5 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => onView(s)} className="flex items-center gap-3 text-left">
                <StudentAvatar name={s.name} photoUrl={s.photoUrl} />
                <div>
                  <p className="font-medium text-white capitalize">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.rollNumber}</p>
                </div>
              </button>
              <StatusBadge status={s.performanceStatus} />
            </div>

            <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-400 mb-4">
              <span>{s.email}</span>
              <span>{s.phone}</span>
              <span>
                {s.course ?? "—"}
                {s.branch ? ` / ${s.branch}` : ""}
              </span>
              <span>Sem {s.semester ?? "—"}</span>
              <span className="text-slate-300 font-medium">Attendance: {typeof s.attendance === "number" ? `${s.attendance}%` : "—"}</span>
              <span className="text-slate-300 font-medium">Avg. marks: {typeof s.averageMarks === "number" ? `${s.averageMarks}%` : "—"}</span>
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-slate-400">
              <button onClick={() => onView(s)} className="flex items-center gap-1 text-xs hover:text-blue-400 transition-colors">
                <Eye size={14} /> View
              </button>
              <button onClick={() => onEdit(s)} className="flex items-center gap-1 text-xs hover:text-blue-400 transition-colors">
                <Pencil size={14} /> Edit
              </button>
              <button onClick={() => onDelete(s)} className="flex items-center gap-1 text-xs hover:text-red-400 transition-colors">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
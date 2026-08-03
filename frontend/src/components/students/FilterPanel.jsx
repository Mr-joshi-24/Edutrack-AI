import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// `options` should be populated from real backend data where possible
// (distinct courses/branches/semesters the API already returns). Falling
// back to empty arrays here rather than inventing sample options.
export default function FilterPanel({
  open,
  onClose,
  filters,
  onChange,
  onApply,
  onClear,
  options = { courses: [], branches: [], semesters: [], divisions: [] },
}) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  const Select = ({ label, field, items }) => (
    <div>
      <label className="block text-xs font-medium text-[#5B7BB3] dark:text-slate-400 mb-1.5">{label}</label>
      <select
        value={filters[field] ?? ""}
        onChange={(e) => set(field, e.target.value)}
        className="w-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-[#0F2A63] dark:text-white outline-none focus:border-[#38BDF8]/60 focus:shadow-[0_0_0_4px_rgba(56,189,248,0.15)]"
      >
        <option value="">All</option>
        {items.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="relative mt-4 bg-gradient-to-br from-white/55 to-white/15 backdrop-blur-2xl backdrop-saturate-150 border border-white/50 dark:border-white/10 rounded-2xl p-5 shadow-[0_8px_32px_rgba(37,99,235,0.14)]">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#8AA3D1] dark:text-slate-500 hover:text-[#0F2A63] dark:text-white"
              aria-label="Close filters"
            >
              <X size={16} />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-6">
              <Select label="Course" field="course" items={options.courses} />
              <Select label="Branch" field="branch" items={options.branches} />
              <Select label="Semester" field="semester" items={options.semesters} />
              <Select label="Division" field="division" items={options.divisions} />

              <div>
                <label className="block text-xs font-medium text-[#5B7BB3] dark:text-slate-400 mb-1.5">
                  Attendance Status
                </label>
                <select
                  value={filters.attendanceStatus ?? ""}
                  onChange={(e) => set("attendanceStatus", e.target.value)}
                  className="w-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-[#0F2A63] dark:text-white outline-none focus:border-[#38BDF8]/60"
                >
                  <option value="">All</option>
                  <option value="good">Good</option>
                  <option value="low">Low</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5B7BB3] dark:text-slate-400 mb-1.5">
                  Performance Status
                </label>
                <select
                  value={filters.performanceStatus ?? ""}
                  onChange={(e) => set("performanceStatus", e.target.value)}
                  className="w-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-[#0F2A63] dark:text-white outline-none focus:border-[#38BDF8]/60"
                >
                  <option value="">All</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="at_risk">At Risk</option>
                  <option value="needs_attention">Needs Attention</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={onClear}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#5B7BB3] dark:text-slate-400 hover:bg-white/40 dark:bg-white/5 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={onApply}
                className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] shadow-[0_0_16px_rgba(37,99,235,0.4)]"
              >
                Apply
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
// `status` should come directly from the backend response
// (e.g. student.performanceStatus). Values expected:
// "excellent" | "good" | "average" | "at_risk" | "needs_attention"
const STYLES = {
  excellent: "bg-[#0EA5A4]/15 text-[#0EA5A4] dark:text-emerald-300 ring-1 ring-[#0EA5A4]/30",
  good: "bg-[#38BDF8]/15 text-[#0369A1] dark:text-sky-300 ring-1 ring-[#38BDF8]/30",
  average: "bg-[#F59E0B]/15 text-[#B45309] dark:text-amber-300 ring-1 ring-[#F59E0B]/30",
  at_risk: "bg-[#F97316]/15 text-[#C2410C] dark:text-orange-300 ring-1 ring-[#F97316]/30",
  needs_attention: "bg-[#DC2626]/15 text-[#DC2626] dark:text-red-400 ring-1 ring-[#DC2626]/30",
};

const LABELS = {
  excellent: "Excellent",
  good: "Good",
  average: "Average",
  at_risk: "At Risk",
  needs_attention: "Needs Attention",
};

export default function StatusBadge({ status }) {
  if (!status || !STYLES[status]) {
    return (
      <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full bg-white/40 dark:bg-white/5 text-[#8AA3D1] dark:text-slate-500 ring-1 ring-white/50">
        Unknown
      </span>
    );
  }

  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
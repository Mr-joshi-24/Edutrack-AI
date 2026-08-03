// Put this at src/components/common/Badge.jsx
//
// Replaces the inline RISK_STYLES map in AIInsightCard.jsx and can be reused
// for status pills anywhere else (attendance status, course status, etc.).
const VARIANTS = {
  danger: "bg-[#DC2626]/15 text-[#F87171] ring-1 ring-[#DC2626]/30",
  info: "bg-[#38BDF8]/15 text-[#7DD3FC] ring-1 ring-[#38BDF8]/30",
  success: "bg-[#0EA5A4]/15 text-[#5EEAD4] ring-1 ring-[#0EA5A4]/30",
  warning: "bg-[#F59E0B]/15 text-[#FBBF24] ring-1 ring-[#F59E0B]/30",
  neutral: "bg-white/10 text-[#AFC3EC] ring-1 ring-white/15",
};

// Existing AIInsightCard risk values ("high"/"medium"/"low") map straight
// onto these so the swap is a one-line change, not a rewrite.
const RISK_TO_VARIANT = { high: "danger", medium: "info", low: "success" };

export default function Badge({ variant, risk, children, className = "" }) {
  const resolved = variant ?? RISK_TO_VARIANT[risk] ?? "neutral";
  return (
    <span
      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${VARIANTS[resolved]} ${className}`}
    >
      {children}
    </span>
  );
}
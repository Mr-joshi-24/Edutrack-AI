import { AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";

// `risk` should be exactly what the backend's analytics/prediction
// endpoint returns (e.g. student.riskLevel: "low" | "medium" | "high").
// If your backend doesn't expose this field yet, pass risk={undefined} —
// this renders a neutral "not available" pill instead of guessing.
const CONFIG = {
  low: {
    label: "Low Risk",
    icon: ShieldCheck,
    className: "bg-[#0EA5A4]/15 text-[#0EA5A4] dark:text-emerald-300 ring-1 ring-[#0EA5A4]/30",
  },
  medium: {
    label: "Medium Risk",
    icon: ShieldAlert,
    className: "bg-[#F59E0B]/15 text-[#B45309] dark:text-amber-300 ring-1 ring-[#F59E0B]/30",
  },
  high: {
    label: "High Risk",
    icon: AlertTriangle,
    className: "bg-[#DC2626]/15 text-[#DC2626] dark:text-red-400 ring-1 ring-[#DC2626]/30",
  },
};

export default function RiskBadge({ risk }) {
  const config = CONFIG[risk];

  if (!config) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/40 dark:bg-white/5 text-[#8AA3D1] dark:text-slate-500 ring-1 ring-white/50">
        Risk data unavailable
      </span>
    );
  }

  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${config.className}`}
    >
      <Icon size={11} />
      {config.label}
    </span>
  );
}
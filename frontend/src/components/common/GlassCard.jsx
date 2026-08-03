// Put this at src/components/common/GlassCard.jsx
//
// Centralizes the "frosted glass panel" look that was previously
// copy-pasted (with the same class string) across StatCard, PerformanceChart,
// the Dashboard recent-activity panel, and Navbar's dropdowns. Existing
// components can adopt this incrementally — it doesn't require changing
// their public props.
//
// `tone="light"` = the airy white/blue glass used for StatCard/PerformanceChart.
// `tone="dark"`  = the navy glass used for Sidebar/AIInsightCard.
// Both tones render correctly in either theme; `tone` is about the panel's
// own accent, not the app-wide light/dark mode.
export default function GlassCard({
  as: Component = "div",
  tone = "light",
  className = "",
  children,
  ...rest
}) {
  const toneClasses =
    tone === "dark"
      ? "bg-gradient-to-br from-[#0B1E45]/80 via-[#122a5c]/70 to-[#14306B]/60 border-white/10 text-[#E7EEFF] shadow-[0_16px_48px_rgba(11,30,69,0.4)]"
      : "bg-gradient-to-br from-white/55 to-white/15 dark:from-white/10 dark:to-white/[0.03] border-white/50 dark:border-white/10 text-[#0F2A63] dark:text-[#E7EEFF] shadow-[0_8px_32px_rgba(37,99,235,0.14)]";

  return (
    <Component
      className={`relative backdrop-blur-2xl backdrop-saturate-150 rounded-2xl border overflow-hidden ${toneClasses} ${className}`}
      {...rest}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
      {children}
    </Component>
  );
}
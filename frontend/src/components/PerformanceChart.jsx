import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
// CHANGED: added dark-mode support. Recharts takes real color values (not
// Tailwind classes), so grid/axis/tooltip colors are picked from useTheme()
// rather than expressed as `dark:` classes like the rest of the app.
import { useTheme } from "../context/ThemeContext";

const FALLBACK_DATA = [
  { name: "Rahul", marks: 90 },
  { name: "Amit", marks: 70 },
  { name: "Priya", marks: 95 },
  { name: "Neha", marks: 55 },
];

// `data` is a plain prop — hand it the real /api/performance response and
// this renders it, no other wiring needed. `isLoading` / `error` cover the
// fetch lifecycle so the parent page can drive this straight from a
// useEffect + fetch (see Dashboard.jsx) without this component changing.
export default function PerformanceChart({
  data = FALLBACK_DATA,
  isLoading = false,
  error = null,
  title = "Student Performance",
}) {
  const [view, setView] = useState("bar");
  const { isDark } = useTheme();

  const gridColor = isDark ? "#1E293B" : "#DCE8FF";
  const axisTickColor = isDark ? "#8FA9DD" : "#5B7BB3";
  const tooltipStyle = {
    borderRadius: 10,
    border: isDark ? "1px solid #1E293B" : "1px solid #DCE8FF",
    fontSize: 13,
    backgroundColor: isDark ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.9)",
    backdropFilter: "blur(12px)",
    color: isDark ? "#E7EEFF" : "#0F2A63",
  };

  return (
    <div className="relative bg-gradient-to-br from-white/55 to-white/15 dark:from-white/10 dark:to-white/[0.03] backdrop-blur-2xl backdrop-saturate-150 p-6 rounded-2xl shadow-[0_8px_32px_rgba(37,99,235,0.14)] border border-white/50 dark:border-white/10 h-96 flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />

      <div className="relative flex items-center justify-between mb-4">
        <h2
          className="text-xl font-semibold bg-gradient-to-r from-[#0F2A63] to-[#2563EB] dark:from-white dark:to-[#9FC6FF] bg-clip-text text-transparent"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {title}
        </h2>

        <div className="flex text-xs font-medium bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-full p-1">
          {["bar", "line"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-full capitalize transition-all ${
                view === v
                  ? "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-[0_0_14px_rgba(37,99,235,0.5)]"
                  : "text-[#5B7BB3] dark:text-[#8FA9DD]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center text-sm text-[#DC2626] text-center px-4">
          Couldn't load performance data. {error}
        </div>
      ) : isLoading ? (
        <div className="flex-1 animate-pulse rounded-xl bg-white/40 dark:bg-white/5" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {view === "bar" ? (
            <BarChart data={data}>
              <defs>
                <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: axisTickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: axisTickColor }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="marks" fill="url(#barFill)" radius={[8, 8, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: axisTickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: axisTickColor }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="marks"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 4, fill: "#38BDF8" }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}
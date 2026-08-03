import { motion } from "framer-motion";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function StatCard({
  title,
  value,
  color, // optional override; default is white text
  icon: Icon,
  trend, // e.g. 4.2 or -1.8 (percent change vs. last term)
  ring, // 0-100, draws the "graded" progress ring in the corner
}) {
  const positive = typeof trend === "number" ? trend >= 0 : null;
  const circumference = 2 * Math.PI * 20;
  const offset =
    typeof ring === "number"
      ? circumference - (Math.min(Math.max(ring, 0), 100) / 100) * circumference
      : circumference;
  const gradId = `ring-grad-${title?.replace(/\s+/g, "") ?? "stat"}`;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="relative bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-lg overflow-hidden group hover:border-white/20 transition-all"
    >
      {/* Subtle top glare & bottom glow to keep the premium feel */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-400 mb-1">{title}</h2>
          <h1
            className={`text-4xl font-bold mt-1 ${color ? color : "text-white"}`}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {value}
          </h1>

          {typeof trend === "number" && (
            <div
              className={`inline-flex items-center gap-1 mt-3 text-xs font-semibold ${
                positive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {positive ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
              {Math.abs(trend)}%<span className="text-slate-500 font-normal ml-1">vs last term</span>
            </div>
          )}
        </div>

        {typeof ring === "number" ? (
          <svg width="56" height="56" viewBox="0 0 52 52" className="shrink-0 drop-shadow-[0_0_8px_rgba(37,99,235,0.35)]">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
            </defs>
            {/* Track color changed to match the dark glass border */}
            <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle
              cx="26"
              cy="26"
              r="20"
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 26 26)"
            />
            <text
              x="26"
              y="30"
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              className="fill-white"
            >
              {ring}%
            </text>
          </svg>
        ) : (
          Icon && (
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 shadow-inner flex items-center justify-center text-blue-400 shrink-0">
              <Icon size={20} />
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}
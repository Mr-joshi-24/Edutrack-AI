// CHANGED: react-icons/fa -> lucide-react
// FaChartPie->LayoutDashboard, FaUserGraduate->GraduationCap,
// FaClipboardCheck->ClipboardCheck, FaBook->BookOpen, FaChartBar->BarChart3,
// FaTimes->X, FaSignOutAlt->LogOut
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  BarChart3,
  X,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Students", icon: GraduationCap },
  { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/marks", label: "Marks", icon: BookOpen },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

// `user` and `onLogout` are props so the real signed-in admin (name, role,
// avatar) and the real logout call can be wired in from wherever auth
// state already lives — this component never assumes where that data
// comes from.
//
// NOTE: Sidebar stays visually dark-navy-glass in both light and dark app
// themes (a deliberate choice — Stripe/Linear-style dashboards commonly
// keep the sidebar as a fixed dark accent regardless of the content
// theme). Flag if you'd rather it flip to a light glass panel in light mode.
export default function Sidebar({
  mobileOpen = false,
  onCloseMobile = () => {},
  user = { name: "Admin User", role: "Administrator" },
  onLogout = () => {
    // TODO: wire to real logout (clear session / call /api/auth/logout)
    console.log("logout");
  },
}) {
  const { pathname } = useLocation();

  const content = (
    <div className="relative flex h-full flex-col bg-gradient-to-b from-[#0B1E45]/70 via-[#102a5e]/60 to-[#14306B]/50 backdrop-blur-2xl backdrop-saturate-150 border-r border-white/10 text-[#E7EEFF] p-5 shadow-[8px_0_40px_rgba(11,30,69,0.35)]">
      {/* glass sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className="pointer-events-none absolute -top-20 -left-10 w-56 h-56 rounded-full bg-[#38BDF8]/20 blur-3xl" />

      <div className="relative flex items-center justify-between mb-10 px-1">
        <div className="flex items-baseline gap-2">
          <span
            className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-[#9FC6FF] bg-clip-text text-transparent"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            EduTrack
          </span>
          <span className="text-[10px] font-semibold tracking-widest px-1.5 py-0.5 rounded bg-[#38BDF8] text-[#0B1E45] shadow-[0_0_14px_rgba(56,189,248,0.7)]">
            AI
          </span>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden text-[#9FB8E8] hover:text-white"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="relative flex flex-col gap-1.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={`
                group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                border transition-all
                ${
                  active
                    ? "bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-md border-[#38BDF8]/50 text-white shadow-[0_0_20px_rgba(56,189,248,0.25)]"
                    : "border-transparent text-[#AFC3EC] hover:bg-white/8 hover:border-white/10 hover:text-white"
                }
              `}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[#38BDF8] shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
              )}
              <Icon
                className={active ? "text-[#38BDF8]" : "text-[#6E8FCB] group-hover:text-[#38BDF8]"}
                size={16}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-auto pt-6 border-t border-white/10 flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#1D4ED8] text-white flex items-center justify-center font-bold shadow-[0_0_16px_rgba(56,189,248,0.5)]">
          {user.name?.charAt(0) ?? "A"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
          <p className="text-xs text-[#8FA9DD] truncate">{user.role}</p>
        </div>
        <button
          onClick={onLogout}
          aria-label="Log out"
          className="text-[#8FA9DD] hover:text-[#38BDF8] transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block fixed w-72 h-screen z-20">{content}</div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-[#0B1E45]/50 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="absolute left-0 top-0 w-72 h-full">{content}</div>
        </div>
      )}
    </>
  );
}
import { useState } from "react";
// CHANGED: react-icons/fa -> lucide-react (FaBell->Bell, FaSearch->Search,
// FaBars->Menu, FaChevronDown->ChevronDown).
import { Bell, Search, Menu, ChevronDown } from "lucide-react";
import ThemeToggle from "./common/ThemeToggle";

// All dynamic data arrives via props with safe defaults, so this drops
// into the layout whether or not the backend calls have been wired up
// yet: pass a real `user` object and `notifications` array once the
// session/notifications endpoints are ready.
export default function Navbar({
  user = { name: "Admin User", role: "Administrator" },
  notifications = [],
  onMenuClick = () => {},
  onSearch = () => {
    // TODO: hook up to /api/students/search (or similar) as the user types
  },
}) {
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="relative h-20 bg-gradient-to-r from-white/50 to-white/30 dark:from-[#0B1E45]/70 dark:to-[#122a5c]/50 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/50 dark:border-white/10 flex items-center justify-between px-5 sm:px-8 gap-4 sticky top-0 z-10 shadow-[0_4px_30px_rgba(37,99,235,0.08)] transition-colors">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/40 to-transparent" />

      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[#0B1E45] dark:text-white"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="hidden sm:block">
          <h1
            className="text-xl font-bold bg-gradient-to-r from-[#0F2A63] to-[#2563EB] dark:from-white dark:to-[#9FC6FF] bg-clip-text text-transparent"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Student Analytics
          </h1>
          <p className="text-xs text-[#5B7BB3] dark:text-[#8FA9DD]">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div
        className={`flex-1 max-w-md hidden md:flex items-center gap-2 bg-white/40 dark:bg-white/5 backdrop-blur-md border rounded-full px-4 py-2.5 transition-all ${
          searchFocused
            ? "border-[#38BDF8]/60 shadow-[0_0_0_4px_rgba(56,189,248,0.15)]"
            : "border-white/60 dark:border-white/10"
        }`}
      >
        <Search className="text-[#5B7BB3] dark:text-[#8FA9DD]" size={14} />
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search students, classes, reports…"
          className="bg-transparent outline-none text-sm w-full placeholder:text-[#8AA3D1] text-[#0F2A63] dark:text-white dark:placeholder:text-[#8FA9DD]"
        />
      </div>

      <div className="flex items-center gap-5">
        <ThemeToggle />

        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative text-[#2C4A82] dark:text-[#AFC3EC] hover:text-[#0B1E45] dark:hover:text-white transition-colors"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {notifications.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#3B82F6] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                {notifications.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white/60 dark:bg-[#122a5c]/90 backdrop-blur-2xl backdrop-saturate-150 rounded-xl shadow-[0_16px_48px_rgba(37,99,235,0.25)] border border-white/60 dark:border-white/10 py-2 z-30">
              <p className="px-4 py-2 text-xs font-semibold text-[#5B7BB3] dark:text-[#8FA9DD] uppercase tracking-wide">
                Notifications
              </p>
              {notifications.length === 0 ? (
                <p className="px-4 py-3 text-sm text-[#8AA3D1] dark:text-[#8FA9DD]">
                  You're all caught up.
                </p>
              ) : (
                notifications.map((n, i) => (
                  <div
                    key={i}
                    className="px-4 py-2.5 text-sm text-[#0F2A63] dark:text-[#E7EEFF] hover:bg-white/50 dark:hover:bg-white/5"
                  >
                    {n.message}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F2A63] to-[#1D4ED8] text-[#38BDF8] flex items-center justify-center font-bold shadow-[0_0_16px_rgba(29,78,216,0.4)]">
              {user.name?.charAt(0) ?? "A"}
            </div>
            <ChevronDown className="hidden sm:block text-[#8AA3D1] dark:text-[#8FA9DD]" size={11} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white/60 dark:bg-[#122a5c]/90 backdrop-blur-2xl backdrop-saturate-150 rounded-xl shadow-[0_16px_48px_rgba(37,99,235,0.25)] border border-white/60 dark:border-white/10 py-2 z-30 text-sm">
              <p className="px-4 py-2 border-b border-white/50 dark:border-white/10">
                <span className="block font-semibold text-[#0F2A63] dark:text-white">{user.name}</span>
                <span className="block text-xs text-[#5B7BB3] dark:text-[#8FA9DD]">{user.role}</span>
              </p>
              <button className="w-full text-left px-4 py-2 hover:bg-white/50 dark:hover:bg-white/5 text-[#0F2A63] dark:text-[#E7EEFF]">
                Account settings
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-white/50 dark:hover:bg-white/5 text-[#DC2626]">
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
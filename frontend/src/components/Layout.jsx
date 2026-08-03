import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // TODO: `npm install react-hot-toast` if not already in the project
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

// Shared shell for every route. Sidebar + Navbar stay mounted while the
// page body (Dashboard / Students / Attendance / Marks / Reports) swaps
// underneath via <Outlet />. Routing paths are untouched here — this only
// wraps the existing <Route> elements, so any backend calls living inside
// those page components are unaffected.
//
// Background and ambient glow carry `dark:` variants so the theme toggle
// (see ThemeToggle.jsx) actually changes the page, not just the
// Sidebar/Navbar. Requires tailwind.config.js `darkMode: "class"`.
export default function Layout({ user, notifications = [] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#EEF4FF] dark:bg-[#0F172A] overflow-hidden transition-colors">
      {/* Without a <Toaster/> mounted somewhere, toast.success()/toast.error()
          calls anywhere in the app (Students.jsx, etc.) silently do nothing. */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.6)",
            color: "#0F2A63",
            fontSize: "14px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(37,99,235,0.18)",
          },
          success: { iconTheme: { primary: "#2563EB", secondary: "#fff" } },
          error: { iconTheme: { primary: "#DC2626", secondary: "#fff" } },
        }}
      />

      {/* Vivid, saturated ambient glow — glass panels need a colorful,
          high-contrast backdrop to actually read as translucent glass.
          A pale flat background makes backdrop-blur invisible. */}
      <div className="pointer-events-none fixed -top-32 -left-24 w-[32rem] h-[32rem] rounded-full bg-blue-500/40 dark:bg-indigo-500/30 blur-[100px] animate-pulse [animation-duration:6s]" />
      <div className="pointer-events-none fixed top-1/4 -right-32 w-[36rem] h-[36rem] rounded-full bg-cyan-400/40 dark:bg-cyan-400/20 blur-[110px] animate-pulse [animation-duration:8s]" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 w-[30rem] h-[30rem] rounded-full bg-indigo-500/30 dark:bg-violet-500/25 blur-[100px] animate-pulse [animation-duration:7s]" />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#1D4ED8 1px, transparent 1px), linear-gradient(90deg, #1D4ED8 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="relative lg:pl-72">
        <Navbar
          user={user}
          notifications={notifications}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="relative px-5 sm:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
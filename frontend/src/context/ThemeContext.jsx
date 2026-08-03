import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Put this at src/context/ThemeContext.jsx
//
// Requires tailwind.config.js to have `darkMode: "class"` — without that,
// the `dark:` variants added throughout the app (Navbar, Sidebar, Layout,
// StatCard, etc.) won't do anything.
//
// Wrap <App /> with <ThemeProvider> in main.jsx. Any component can then
// call useTheme() to read the current theme or flip it (see
// components/common/ThemeToggle.jsx for the button that does this).

const ThemeContext = createContext(null);

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem("edutrack-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable (privacy mode, etc.) — fall through
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    try {
      window.localStorage.setItem("edutrack-theme", theme);
    } catch {
      // ignore write failures
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      setTheme,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
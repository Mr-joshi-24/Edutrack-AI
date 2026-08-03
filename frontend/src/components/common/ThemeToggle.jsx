import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

// Put this at src/components/common/ThemeToggle.jsx
// Drop <ThemeToggle /> into Navbar.jsx next to the notification bell.
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#2C4A82] dark:text-[#AFC3EC] hover:text-[#0B1E45] dark:hover:text-white bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md transition-colors"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
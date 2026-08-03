import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// CHANGED: react-icons/fa -> lucide-react
// FaPlus->Plus, FaUserPlus->UserPlus, FaClipboardCheck->ClipboardCheck, FaFileAlt->FileText
import { Plus, UserPlus, ClipboardCheck, FileText } from "lucide-react";

// Each action's onClick is a prop with a placeholder default — swap in the
// real handlers (open "add student" modal, POST attendance, generate a
// report) wherever this is mounted; the button/menu behavior stays the same.
export default function FloatingButton({
  actions = [
    { label: "Add student", icon: UserPlus, onClick: () => console.log("add student") },
    { label: "Mark attendance", icon: ClipboardCheck, onClick: () => console.log("mark attendance") },
    { label: "Generate report", icon: FileText, onClick: () => console.log("generate report") },
  ],
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-30">
      <AnimatePresence>
        {open &&
          actions.map(({ label, icon: Icon, onClick }, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => {
                onClick();
                setOpen(false);
              }}
              className="flex items-center gap-2 bg-white/70 dark:bg-[#122a5c]/80 backdrop-blur-2xl backdrop-saturate-150 text-[#0F2A63] dark:text-white pl-4 pr-3 py-2.5 rounded-full shadow-[0_8px_24px_rgba(37,99,235,0.25)] border border-white/60 dark:border-white/10 text-sm font-medium hover:shadow-[0_8px_28px_rgba(37,99,235,0.35)] transition-shadow"
            >
              {label}
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#1D4ED8] flex items-center justify-center text-white">
                <Icon size={12} />
              </span>
            </motion.button>
          ))}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((v) => !v)}
        animate={{
          rotate: open ? 45 : 0,
          boxShadow: open
            ? "0 8px 32px rgba(37,99,235,0.5)"
            : [
                "0 8px 32px rgba(37,99,235,0.4)",
                "0 8px 40px rgba(56,189,248,0.6)",
                "0 8px 32px rgba(37,99,235,0.4)",
              ],
        }}
        transition={open ? { duration: 0.2 } : { duration: 2.5, repeat: Infinity }}
        aria-label="Quick actions"
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#38BDF8] via-[#2563EB] to-[#1D4ED8] backdrop-blur-xl border border-white/30 text-white text-xl flex items-center justify-center"
      >
        <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
        <Plus className="relative" />
      </motion.button>
    </div>
  );
}
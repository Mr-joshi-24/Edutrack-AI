import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function DeleteConfirmModal({ open, student, onCancel, onConfirm, isDeleting }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0B1E45]/40 backdrop-blur-sm"
            onClick={onCancel}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative w-full max-w-sm bg-gradient-to-br from-white/80 to-white/50 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-white/10 rounded-2xl shadow-[0_24px_64px_rgba(220,38,38,0.2)] p-6 text-center"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-[#DC2626]/10 flex items-center justify-center mb-4">
              <AlertTriangle className="text-[#DC2626] dark:text-red-400" size={22} />
            </div>

            <h2 className="text-lg font-semibold text-[#0F2A63] dark:text-white mb-1.5">Delete Student?</h2>
            <p className="text-sm text-[#5B7BB3] dark:text-slate-400 mb-6">
              Are you sure you want to remove{" "}
              <span className="font-medium text-[#0F2A63] dark:text-white">{student?.name}</span>? This action
              cannot be undone.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#5B7BB3] dark:text-slate-400 hover:bg-white/40 dark:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#DC2626] to-[#B91C1C] shadow-[0_0_16px_rgba(220,38,38,0.4)] disabled:opacity-60"
              >
                {isDeleting ? "Deleting…" : "Delete Student"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
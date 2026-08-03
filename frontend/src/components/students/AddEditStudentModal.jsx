import { useEffect } from "react";
import { useForm } from "react-hook-form"; // TODO: `npm install react-hook-form` if not already in the project
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * IMPORTANT — only fields your backend's create/update endpoint actually
 * accepts should be sent. Everything below maps 1:1 to the fields
 * requested in the brief; delete/rename any that don't exist on your
 * real API before wiring `onSubmit`.
 */
const SECTIONS = [
  {
    title: "Personal Information",
    fields: [
      { name: "name", label: "Full Name", required: true },
      { name: "dob", label: "Date of Birth", type: "date" },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        options: ["Male", "Female", "Other"],
      },
      { name: "email", label: "Email", required: true, type: "email" },
      { name: "phone", label: "Phone Number", required: true, type: "tel" },
    ],
  },
  {
    title: "Academic Information",
    fields: [
      { name: "rollNumber", label: "Roll Number", required: true },
      { name: "enrollmentNumber", label: "Enrollment Number" },
      { name: "course", label: "Course" },
      { name: "branch", label: "Branch" },
      { name: "semester", label: "Semester" },
      { name: "division", label: "Division/Section" },
      { name: "admissionYear", label: "Admission Year" },
    ],
  },
  {
    title: "Parent Information",
    fields: [
      { name: "parentName", label: "Parent/Guardian Name" },
      { name: "parentPhone", label: "Parent/Guardian Phone", required: true, type: "tel" },
      { name: "parentEmail", label: "Parent/Guardian Email", type: "email" },
    ],
  },
  {
    title: "Contact",
    fields: [
      { name: "locality", label: "Locality" },
      { name: "city", label: "City" },
      { name: "state", label: "State" },
      { name: "address", label: "Address", fullWidth: true },
    ],
  },
  {
    title: "Optional",
    fields: [{ name: "emergencyContact", label: "Emergency Contact" }],
  },
];

const PHONE_PATTERN = /^[0-9+\-\s()]{7,15}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AddEditStudentModal({ open, student, onClose, onSubmit, isSaving }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: student ?? {} });

  useEffect(() => {
    reset(student ?? {});
  }, [student, reset]);

  const isEdit = Boolean(student?.id);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0B1E45]/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white/80 to-white/50 dark:from-[#0B1E45]/95 dark:to-[#14306B]/85 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-white/10 rounded-2xl shadow-[0_24px_64px_rgba(37,99,235,0.3)]"
          >
            <div className="sticky top-0 flex items-center justify-between px-6 py-5 border-b border-white/40 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl">
              <h2
                className="text-xl font-semibold bg-gradient-to-r from-[#0F2A63] to-[#2563EB] dark:from-white dark:to-sky-300 bg-clip-text text-transparent"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {isEdit ? "Edit Student" : "Add Student"}
              </h2>
              <button onClick={onClose} className="text-[#5B7BB3] dark:text-slate-400 hover:text-[#0F2A63] dark:hover:text-white" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit((values) => onSubmit(values, isEdit))}
              className="px-6 py-5 space-y-6"
            >
              {SECTIONS.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#2563EB] dark:text-sky-400 mb-3">
                    {section.title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {section.fields.map((field) => (
                      <div key={field.name} className={field.fullWidth ? "sm:col-span-2" : ""}>
                        <label className="block text-xs font-medium text-[#5B7BB3] dark:text-slate-400 mb-1.5">
                          {field.label}
                          {field.required && <span className="text-[#DC2626] dark:text-red-400"> *</span>}
                        </label>

                        {field.type === "select" ? (
                          <select
                            {...register(field.name, { required: field.required })}
                            className="w-full bg-white/60 dark:bg-white/10 border border-white/70 dark:border-white/15 rounded-xl px-3 py-2 text-sm text-[#0F2A63] dark:text-white outline-none focus:border-[#38BDF8]/60 focus:shadow-[0_0_0_4px_rgba(56,189,248,0.15)] dark:[color-scheme:dark]"
                          >
                            <option value="">Select…</option>
                            {field.options.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type ?? "text"}
                            {...register(field.name, {
                              required: field.required,
                              pattern:
                                field.type === "tel"
                                  ? { value: PHONE_PATTERN, message: "Enter a valid phone number" }
                                  : field.type === "email"
                                  ? { value: EMAIL_PATTERN, message: "Enter a valid email" }
                                  : undefined,
                            })}
                            className="w-full bg-white/60 dark:bg-white/10 border border-white/70 dark:border-white/15 rounded-xl px-3 py-2 text-sm text-[#0F2A63] dark:text-white outline-none focus:border-[#38BDF8]/60 focus:shadow-[0_0_0_4px_rgba(56,189,248,0.15)] dark:[color-scheme:dark] placeholder:text-[#9AA8C7] dark:placeholder:text-slate-500"
                          />
                        )}

                        {errors[field.name] && (
                          <p className="text-[11px] text-[#DC2626] dark:text-red-400 mt-1">
                            {errors[field.name].message || "This field is required"}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-2 border-t border-white/40 dark:border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[#5B7BB3] dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] shadow-[0_0_16px_rgba(37,99,235,0.4)] disabled:opacity-60"
                >
                  {isSaving ? "Saving…" : isEdit ? "Save Changes" : "Add Student"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
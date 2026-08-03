import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

// Put this at src/hooks/useDashboardSummary.js
//
// Your FastAPI backend has no single endpoint that returns everything the
// Dashboard card grid needs, so this assembles it from three real ones:
//
//   GET /dashboard        -> total_students, attendance_rate, present_count,
//                             absent_count, total_attendance_records
//   GET /students         -> [{ id, name, email, attendance, marks }, ...]
//   GET /analytics/at-risk -> [{ student_id, name, attendance, average_marks }, ...]
//
// Mapping notes (read before changing thresholds/labels):
// - `attendanceToday` is actually /dashboard's overall attendance_rate
//   (present/total across ALL attendance records ever marked) — the
//   backend has no "today" filter yet. Rename the StatCard label if that
//   distinction matters to you, or add a date filter to get_dashboard_stats
//   in crud.py later.
// - `averageMarks` is computed client-side from each student's flat
//   `.marks` field (Student model has this directly — no need to hit
//   /marks and average per-subject records).
// - `performance` (the chart) is also built from students[].marks, capped
//   at the first 8 so the chart stays readable — raise/remove the slice
//   once you have real pagination.
// - `recentActivity` has NO backend source at all right now (no
//   timestamped events/log table exists). It stays as sample data below
//   until you build that endpoint — it's intentionally not wired to
//   anything real.
const RECENT_ACTIVITY_PLACEHOLDER = [
  { student: "Priya Nair", event: "Submitted Unit Test 3", time: "9:12 AM" },
  { student: "Rahul Mehta", event: "Marked present — Class X-B", time: "9:05 AM" },
  { student: "Neha Gupta", event: "Flagged by AI model — low engagement", time: "8:47 AM" },
];

const FALLBACK_SUMMARY = {
  totalStudents: 428,
  attendanceToday: 91.4,
  averageMarks: 76.2,
  atRiskCount: 12,
  performance: [
    { name: "Rahul", marks: 90 },
    { name: "Amit", marks: 70 },
    { name: "Priya", marks: 95 },
    { name: "Neha", marks: 55 },
  ],
  recentActivity: RECENT_ACTIVITY_PLACEHOLDER,
};

export function useDashboardSummary() {
  const query = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const [statsRes, studentsRes, atRiskRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/students"),
        api.get("/analytics/at-risk"),
      ]);

      const stats = statsRes.data;
      const students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      const atRisk = Array.isArray(atRiskRes.data) ? atRiskRes.data : [];

      const averageMarks =
        students.length > 0
          ? students.reduce((sum, s) => sum + (s.marks ?? 0), 0) / students.length
          : 0;

      return {
        totalStudents: stats.total_students ?? 0,
        attendanceToday: stats.attendance_rate ?? 0,
        averageMarks: Math.round(averageMarks * 10) / 10,
        atRiskCount: atRisk.length,
        performance: students
          .slice(0, 8)
          .map((s) => ({ name: s.name, marks: s.marks })),
        // No backend source yet — see note above.
        recentActivity: RECENT_ACTIVITY_PLACEHOLDER,
      };
    },
  });

  return {
    summary: query.data ?? FALLBACK_SUMMARY,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  };
}
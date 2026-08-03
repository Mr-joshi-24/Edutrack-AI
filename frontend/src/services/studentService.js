/**
 * =========================================================================
 * INTEGRATION STATUS (updated against your real src/services/api.js)
 * =========================================================================
 * Confirmed to exist in your FastAPI app (main.py): GET /dashboard,
 * GET /students, GET /marks, GET /analytics/at-risk, POST /register,
 * POST /token. baseURL is the bare server root (no /api prefix) — this
 * file relies on that, matching your api.js.
 *
 * NOT CONFIRMED: POST /students, PUT /students/{id}, DELETE /students/{id}.
 * These weren't in the route list you shared. The functions below are
 * still written against them (so the Add/Edit/Delete UI has something to
 * call), but treat them as a spec for routes you still need to add to
 * main.py, not as routes that already exist. If they don't exist yet,
 * calling them will 404 — Students.jsx already surfaces that as a real
 * toast error rather than pretending it worked.
 *
 * UNKNOWN: the exact JSON shape of GET /students and GET /analytics/at-risk.
 * Field names below (rollNumber, attendance, performanceStatus, riskLevel…)
 * match the brief but may not match your real response — share a sample
 * payload and I'll line these up exactly.
 * =========================================================================
 */
import api from "./api";

export async function getStudents(params = {}) {
  // Confirmed route. Query params (search, course, branch, sortBy, …) are
  // sent in case your handler already reads them; if it ignores unknown
  // params this is harmless — Students.jsx also filters/sorts client-side.
  const { data } = await api.get("/students", { params });
  return data; // shape unconfirmed: array of students, or { items, total }
}

export async function getStudentById(id) {
  // NOT CONFIRMED — verify /students/{id} exists before relying on this.
  const { data } = await api.get(`/students/${id}`);
  return data;
}

// Confirmed route — this is your real ML/analytics endpoint. Use this
// instead of guessing risk client-side. Shape of the response (list of
// {id, riskLevel} vs full student records vs student ids only) is
// unconfirmed — merge logic in Students.jsx is written defensively and
// documents the assumption inline.
export async function getAtRiskStudents() {
  const { data } = await api.get("/analytics/at-risk");
  return data;
}

// NOT CONFIRMED — add this route to main.py if it doesn't exist yet.
// Until then Students.jsx derives the four summary tiles from
// getStudents() + getAtRiskStudents() instead of calling this.
export async function getStudentStats() {
  const { data } = await api.get("/students/stats");
  return data;
}

// NOT CONFIRMED — see note above. `payload` should only include fields
// your backend's create route actually accepts once it exists.
export async function createStudent(payload) {
  const { data } = await api.post("/students", payload);
  return data;
}

// NOT CONFIRMED — see note above.
export async function updateStudent(id, payload) {
  const { data } = await api.put(`/students/${id}`, payload);
  return data;
}

// NOT CONFIRMED — see note above.
export async function deleteStudent(id) {
  await api.delete(`/students/${id}`);
}
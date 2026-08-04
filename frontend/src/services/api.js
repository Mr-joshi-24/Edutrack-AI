import axios from "axios";

// 1. Initialize the Axios client with dynamic environment support (defaults to local FastAPI server)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://edutrack-ai-backend-oouq.onrender.com",
});

// Optional token interceptor (uncomment if you add route protection later)
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("edutrack-token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// 2. Authentication & Login helper
export const loginUser = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email); 
  formData.append('password', password);

  const response = await fetch(`${api.defaults.baseURL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Authentication failed');
  }

  return response.json();
};

// 3. Students & Attendance API Calls
export const fetchStudents = async () => {
  const response = await api.get('/students');
  return response.data;
};

export const fetchAttendance = async () => {
  const response = await api.get('/attendance');
  return response.data;
};

export const fetchAtRiskStudents = async () => {
  const response = await api.get('/analytics/at-risk');
  return response.data;
};

export const submitAttendance = async (attendanceData) => {
  const response = await api.post('/attendance', attendanceData);
  return response.data;
};

// 4. PDF Calendar & Timetable Uploads
export const uploadCalendarPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/calendar/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const uploadTimetablePdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/timetable/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// 5. Marks & Analytics API Calls
export const fetchMarks = async () => {
  const response = await api.get('/marks');
  return response.data;
};

export const submitMarks = async (markData) => {
  const response = await api.post('/marks', markData);
  return response.data;
};

export const downloadPerformanceExcel = () => {
  window.open(`${api.defaults.baseURL}/reports/performance-excel`, '_blank');
};

// 6. Bulk Upload Helpers
export const uploadBulkAttendance = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/attendance/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const uploadBulkMarks = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/marks/bulk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// 7. Reports & ML Predictions
export const downloadCompiledMarksheet = async () => {
  const response = await api.get('/reports/compiled-marksheet', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Compiled_Master_Marksheet.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const fetchMlPrediction = async (studentId) => {
  const response = await api.get(`/analytics/ml-predict/${studentId}`);
  return response.data;
};

export const uploadAttendancePdf = async (file, subject = "General") => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/attendance/bulk-pdf-upload?subject=${subject}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export default api;
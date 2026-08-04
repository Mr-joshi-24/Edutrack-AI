import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from './pages/Login';
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import Marks from "./pages/Marks";
import Reports from "./pages/Reports";

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");
  return token ? <Navigate to="/dashboard" replace /> : children;
};


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Login Page */}
        <Route 
          path="/" 
          element={<AuthRoute><Login /></AuthRoute>} 
        />

        <Route 
          path="/login" 
          element={<AuthRoute><Login /></AuthRoute>} 
        />


        {/* Protected Application Pages */}
        <Route element={<Layout />}>

          <Route 
            path="/dashboard" 
            element={<Dashboard />} 
          />

          <Route 
            path="/students" 
            element={<Students />} 
          />

          <Route 
            path="/attendance" 
            element={<Attendance />} 
          />

          <Route 
            path="/marks" 
            element={<Marks />} 
          />

          <Route 
            path="/reports" 
            element={<Reports />} 
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;
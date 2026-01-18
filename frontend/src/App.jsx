import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// --- 1. IMPORT TOASTIFY ---
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// --------------------------

import MainLayout from "./components/Mainlayout";
import Login from "./pages/Login";

// Import các trang
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import AdminHome from "./pages/AdminHome";
import EmployeeHome from "./pages/EmployeeHome";
import LeavePage from "./pages/LeavePage";
import EmployeeDashboard from "./pages/EmployeeDashboard"; // Nếu bạn dùng file này

// Component bảo vệ Route
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      {/* --- 2. CẤU HÌNH KHUNG THÔNG BÁO --- */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {/* ----------------------------------- */}

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* === ADMIN ROUTES === */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <MainLayout>
                <AdminHome />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/leaves"
          element={
            <PrivateRoute>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <MainLayout>
                <UserManagement />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* === EMPLOYEE ROUTES === */}
        <Route
          path="/employee"
          element={
            <PrivateRoute>
              <MainLayout>
                <EmployeeHome />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* Trang xin nghỉ phép (Dùng LeavePage hoặc EmployeeDashboard tùy bạn) */}
        <Route
          path="/employee/leaves"
          element={
            <PrivateRoute>
              <MainLayout>
                <LeavePage />
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

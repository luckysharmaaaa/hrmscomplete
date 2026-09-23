// ```jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider, useSidebar } from "./context/SidebarContext";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import User from "./pages/User";
import Profile from "./pages/Profile/Profile";
import Roles from "./pages/Roles";
import Modules from "./pages/Modules";

import LeaveAdmin from "./pages/LeaveAdmin";
import LeaveEmployee from "./pages/LeaveEmployee";
import LeaveSetting from "./pages/LeaveSetting";

import AttendanceAdmin from "./pages/AttendanceAdmin";
import AttendanceEmployee from "./pages/AttendanceEmployee";

import HolidayCalender from "./pages/HolidayCalender";
import WfhManagement from "./pages/WfhManagement";

import EmployeeList from "./pages/EmployeeList";
import EmployeeDetail from "./pages/EmployeeDetail";
import Designation from "./pages/Designation";
import Department from "./pages/Department";

import AttendanceRegularizationAdmin from "./pages/AttendanceRegularizationAdmin";

// Auth Pages
// Make sure these files actually exist at these locations.
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import FirstTimeAccess from "./pages/Firsttimeaccess";

// ─────────────────────────────────────────────────────────────────────────
// LayoutContent
// ─────────────────────────────────────────────────────────────────────────

function LayoutContent() {
  const location = useLocation();
  const { collapsed } = useSidebar();

  const mainMarginClass = `
    ${collapsed ? "lg:ml-[76px]" : "lg:ml-60"}
    pt-18 lg:pt-20
    px-4 sm:px-6 lg:px-8
    py-4 lg:py-5
  `;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main
          className={`
            flex-1
            min-w-0
            ${mainMarginClass}
            min-h-screen
            overflow-x-hidden
            transition-all
            duration-300
          `}
        >
          <Routes>
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* User / Profile */}
            <Route path="/user" element={<User />} />
            <Route path="/profile" element={<Profile />} />

            {/* RBAC */}
            <Route path="/roles" element={<Roles />} />
            <Route path="/modules" element={<Modules />} />

            {/* Leave */}
            <Route path="/leave-admin" element={<LeaveAdmin />} />
            <Route path="/leave-employee" element={<LeaveEmployee />} />
            <Route path="/leave-setting" element={<LeaveSetting />} />

            {/* Attendance */}
            <Route
              path="/attendance-admin"
              element={<AttendanceAdmin />}
            />

            <Route
              path="/attendance-employee"
              element={<AttendanceEmployee />}
            />

            {/* Attendance Regularization */}
            <Route
              path="/attendance-regularization"
              element={<AttendanceRegularizationAdmin />}
            />

            {/* Holiday */}
            <Route
              path="/holiday-calender"
              element={<HolidayCalender />}
            />

            {/* WFH */}
            <Route
              path="/wfh-management"
              element={<WfhManagement />}
            />

            {/* Employee */}
            <Route
              path="/employee-list"
              element={<EmployeeList />}
            />

            <Route
              path="/employee/:id"
              element={<EmployeeDetail />}
            />

            {/* Organization */}
            <Route
              path="/designations"
              element={<Designation />}
            />

            <Route
              path="/department"
              element={<Department />}
            />

            {/* Forgot / Reset Password */}
            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            <Route
              path="/reset-password"
              element={<ResetPassword />}
            />


            <Route path="/first-time-access" element={<FirstTimeAccess />} />

          </Routes>
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Dashboard Layout
// ─────────────────────────────────────────────────────────────────────────

function Layout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />
          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          {/* Application */}
          <Route path="/*" element={<Layout />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
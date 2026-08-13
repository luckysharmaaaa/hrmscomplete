import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import User from "./pages/User";
import Profile from "./pages/Profile/Profile"; // ✅ Updated Import
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

function Layout() {
  const location = useLocation();
  const hideLayout = location.pathname === "/";

  return (
    <div className="min-h-screen bg-slate-100">
      {!hideLayout && <Navbar />}

      <div className="flex">
        {!hideLayout && <Sidebar />}

        <main
          className={`flex-1 ${
            hideLayout ? "p-0" : "ml-64 mt-20 p-5"
          } min-h-screen`}
        >
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user" element={<User />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/modules" element={<Modules />} />

            <Route path="/leave-admin" element={<LeaveAdmin />} />
            <Route path="/leave-employee" element={<LeaveEmployee />} />
            <Route path="/leave-setting" element={<LeaveSetting />} />

            <Route
              path="/attendance-admin"
              element={<AttendanceAdmin />}
            />
            <Route
              path="/attendance-employee"
              element={<AttendanceEmployee />}
            />

            <Route
              path="/holiday-calender"
              element={<HolidayCalender />}
            />

            <Route
              path="/wfh-management"
              element={<WfhManagement />}
            />

            <Route
              path="/employee-list"
              element={<EmployeeList />}
            />

            <Route
              path="/employee/:id"
              element={<EmployeeDetail />}
            />

            <Route
              path="/designations"
              element={<Designation />}
            />

            <Route
              path="/department"
              element={<Department />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login */}
          <Route path="/" element={<Login />} />

          {/* Dashboard Layout */}
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
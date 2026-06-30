import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import ApplyLeave from "./pages/ApplyLeave";
import LeaveHistory from "./pages/LeaveHistory";
import Dashboard from "./pages/Dashboard";
import User from "./pages/User";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Roles from "./pages/Roles";
import LeaveSetting from "./pages/LeaveSetting";
import RolesPermissions from "./pages/RolesPermissions";
import AttendanceEmployee from "./pages/AttendanceEmployee";
import HolidayCalender from "./pages/HolidayCalender";
import WfhManagement from "./pages/WfhManagement";
import AttendanceAdmin from "./pages/AttendanceAdmin";
import Modules from "./pages/Modules";

function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/profile";
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 ml-64 mt-20 p-5 min-h-screen">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/apply-leave" element={<ApplyLeave />} />
            <Route path="/leave-history" element={<LeaveHistory />} />
            <Route path="/user" element={<User />} />
            <Route className="flex-1" path="/profile" element={<Profile />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leave-setting" element={<LeaveSetting />} />
            <Route path="/rolespermissions" element={<RolesPermissions />} />
            <Route path="/attendance-admin" element={<AttendanceAdmin />} />
            <Route
              path="/attendance-employee"
              element={<AttendanceEmployee />}
            />
            <Route path="/holiday-calender" element={<HolidayCalender />} />
            <Route path="/wfh-management" element={<WfhManagement />} />
            <Route path="/modules" element={<Modules />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

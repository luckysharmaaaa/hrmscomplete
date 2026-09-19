import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider, useSidebar } from "./context/SidebarContext";

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

import AttendanceRegularizationAdmin from "./pages/AttendanceRegularizationAdmin";

// ─────────────────────────────────────────────────────────────────────────
// LayoutContent — this is your original `Layout`, unchanged except for the
// <main> margin. It now reads `collapsed` from the sidebar context, so its
// left margin shrinks from 240px to 76px exactly in step with the rail —
// it has to live BELOW <SidebarProvider> (not inside the same component
// that creates the provider) to be able to call useSidebar() at all.
// ─────────────────────────────────────────────────────────────────────────
function LayoutContent() {
  const location = useLocation();
  const hideLayout = location.pathname === "/";
  const { collapsed } = useSidebar();

  // ── RESPONSIVE + RAIL-WIDTH FIX ──────────────────────────────────────
  // Previously: <main className={hideLayout ? "p-0" : "ml-64 mt-20 p-5"}>
  //
  // Two issues fixed here:
  //  1. `ml-64` was unconditional below 1024px too, so on a phone the
  //     content was pushed 256px right of a ~360-390px viewport. Now it's
  //     `lg:ml-*` — only applied once the sidebar is actually docked.
  //  2. The docked sidebar itself is now 240px expanded / 76px collapsed
  //     (see Sidebar.jsx) instead of a flat 256px, so <main>'s margin has
  //     to track `collapsed` or the two would drift out of sync and
  //     leave either a gap or an overlap.
  const mainMarginClass = hideLayout
    ? "p-0"
    : `${collapsed ? "lg:ml-[76px]" : "lg:ml-60"} pt-18 lg:pt-20 px-4 sm:px-6 lg:px-8 py-4 lg:py-5`;

  return (
    <div className="min-h-screen bg-slate-100">
      {!hideLayout && <Navbar />}

      <div className="flex">
        {!hideLayout && <Sidebar />}

        <main
          className={`flex-1 min-w-0 ${mainMarginClass} min-h-screen overflow-x-hidden transition-all duration-300`}
        >
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user" element={<User />} />
            <Route path="/profile" element={<Profile />} />
<<<<<<< HEAD
            <Route path="/roles" element={<Roles />} />
            <Route path="/modules" element={<Modules />} />

            <Route path="/leave-admin" element={<LeaveAdmin />} />
            <Route path="/leave-employee" element={<LeaveEmployee />} />
=======
            <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees-details" element={<EmployeeDetails />} />
>>>>>>> 48803cdf87bb9703070cb4e65ff9e45b5189e42a
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
            <Route path="/attendance-regularization"
             element={<AttendanceRegularizationAdmin />} 
             
             />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Thin wrapper: sets up the provider, LayoutContent (below it in the tree)
// consumes it. Keeping this split is what lets <main>'s margin react to
// the collapsed state without prop-drilling it down from App.
function Layout() {
  return (
<<<<<<< HEAD
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
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

=======
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* All Other Pages */}
        <Route path="/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
}

>>>>>>> 48803cdf87bb9703070cb4e65ff9e45b5189e42a
export default App;
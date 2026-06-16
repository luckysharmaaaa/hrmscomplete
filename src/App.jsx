import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import ApplyLeave from "./pages/ApplyLeave";
import LeaveHistory from "./pages/LeaveHistory";
import Dashboard from "./pages/Dashboard";
import User from "./pages/User";
import EmployeeList from "./pages/employeelist";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import EmployeeDetails from "./pages/EmployeeDetails";
import LeaveSetting from "./pages/LeaveSetting";

function Layout() {
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
            <Route path="/profile" element={<Profile />} />
            <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees-details" element={<EmployeeDetails />} />
            <Route path="/leave-setting" element={<LeaveSetting />} />
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
        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* All Other Pages */}
        <Route path="/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
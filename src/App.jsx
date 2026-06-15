import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import ApplyLeave from "./pages/ApplyLeave";
import LeaveHistory from "./pages/LeaveHistory";
import Dashboard from "./pages/Dashboard";
import User from "./pages/User";
import EmployeeList from "./pages/employeelist";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100">
        {/* Fixed Navbar */}
        <Navbar />

        <div className="flex">
          {/* Fixed Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 ml-64 mt-20 p-5 min-h-screen">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/apply-leave" element={<ApplyLeave />} />
              <Route path="/leave-history" element={<LeaveHistory />} />
              <Route path="/user" element={<User />} />
              <Route path="/employees" element={<EmployeeList/>} />


            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

// import React from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Login from "./pages/Login";
// import SignUp from "./pages/SignUp";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<SignUp />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

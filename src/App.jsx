import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ApplyLeave from "./pages/ApplyLeave";
import LeaveHistory from "./pages/LeaveHistory";
import Navbar from "./components/Navbar"
import Dashboard from "./pages/Dashboard"

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Navbar />
        <Sidebar />

        <div className="ml-64 mt-20 p-5">
          <Routes>
            <Route path="/apply-leave" element={<ApplyLeave />} />
            <Route path="/leave-history" element={<LeaveHistory />} />
            <Route path = "/dashboard" element={<Dashboard/>}/>
          </Routes>
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
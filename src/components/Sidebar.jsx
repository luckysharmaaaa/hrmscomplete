import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, FileText, History } from "lucide-react";
import logo_img from "../assets/images/logo.svg"

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-[#F8F9FA] border-r border-gray-200 fixed left-0 top-0 p-6">


      {/* <h1 className="text-3xl font-bold mb-10">
        Smart<span className="text-orange-500">HR</span>
      </h1> */}

      <div>
        <img
          src={logo_img}
          alt="Logo"
          className="w-35 mb-10 object-contain"
        />
      </div>

      <p className="text-gray-500 text-xs mb-4 uppercase">
        Main Menu
      </p>

      <ul className="space-y-3">


        <li>
          <Link
            to="/apply-leave"
            className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition"
          >
            <FileText size={18} />
            Dashboard
          </Link>
        </li>


        <li>
          <Link
            to="/apply-leave"
            className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition"
          >
            <FileText size={18} />
            Apply Leave
          </Link>
        </li>

        <li>
          <Link
            to="/leave-history"
            className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition"
          >
            <History size={18} />
            Leave History
          </Link>
        </li>

        {/* ----------- */}
        <li>
          <Link
            to="/Login"

            className="flex items-center gap-3 p-3 rounded-lg text-red-500 hover:bg-red-50 transition"

          >
            <History size={18} />
            Logout
          </Link>
        </li>


      </ul>
    </div>
  );
}

export default Sidebar;
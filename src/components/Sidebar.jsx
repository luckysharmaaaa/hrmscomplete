import React from "react";
import { Link , useNavigate} from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  History,
  LogOut,
  User
} from "lucide-react";

import logo_img from "../assets/images/logo.svg";

function Sidebar() {
  const navigate = useNavigate()

  return (
    <div className="w-64 h-screen bg-[#F7F7F7] border-r border-gray-200 fixed left-0 top-0 overflow-y-auto">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200">
        <img
          src={logo_img}
          alt="Logo"
          className="w-36 object-contain"
        />
      </div>

      {/* Menu */}
      <div className="px-4 py-5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase mb-4">
          Main Menu
        </p>

        <ul className="space-y-2">

          {/* Dashboard */}
          <li>
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition"
            >
              <LayoutDashboard size={18} />
              <span className="font-medium">
                Dashboard
              </span>
            </Link>
          </li>

          {/* Apply Leave */}
          <li>
            <Link
              to="/apply-leave"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition"
            >
              <FileText size={18} />
              <span className="font-medium">
                Apply Leave
              </span>
            </Link>
          </li>

          {/* Leave History */}
          <li>
            <Link
              to="/leave-history"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition"
            >
              <History size={18} />
              <span className="font-medium">
                Leave History
              </span>
            </Link>
          </li>

  <li>
            <Link
              to="/employees"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition"
            >
              <History size={18} />
              <span className="font-medium">
                Employees List
              </span>
            </Link>
          </li>
          {/* User */}
          <li>
            <Link
              to="/user"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition"
            >
              <User size={18} />
              <span className="font-medium">
                Users
              </span>
            </Link>
          </li>

          {/* User */}
          <li>
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition"
            >
              <User size={18} />
              <span className="font-medium">
                Profile
              </span>
            </Link>
          </li>


          {/* Logout */}
          <li>
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition"
            >
              <LogOut size={18} />
              <span className="font-medium" onClick={()=>{navigate("/")}}>
                Logout
              </span>
            </Link>
          </li>

        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
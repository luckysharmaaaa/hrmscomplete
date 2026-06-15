import React from "react";
import { Bell, Mail, Search, Settings } from "lucide-react";

function Navbar() {
  return (
    <nav className="fixed top-0 left-64 right-0 h-18 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-50">
      {/* Search Box */}
      <div className="relative w-[320px]">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search in HRMS"
          className="w-full h-11 pl-12 pr-4 rounded-lg border border-gray-200 bg-[#FAFAFA] outline-none focus:border-orange-400"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">
        {/* Settings */}
        <button className="text-gray-600 hover:text-orange-500 transition">
          <Settings size={20} />
        </button>

        {/* Mail */}
        <button className="text-gray-600 hover:text-orange-500 transition">
          <Mail size={20} />
        </button>

        {/* Notification */}
        <button className="relative text-gray-600 hover:text-orange-500 transition">
          <Bell size={20} />

          <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer border-l pl-5">
          <img
            src="https://i.pravatar.cc/100?img=12"
            alt="profile"
            className="w-10 h-10 rounded-full object-cover border"
          />

          <div>
            <h3 className="text-sm font-semibold text-gray-800">Lucky</h3>

            <p className="text-xs text-gray-500">Employee</p>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

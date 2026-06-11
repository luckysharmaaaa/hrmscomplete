import React from "react";
import { Bell } from "lucide-react";

function Navbar() {
  return (
    <nav className="fixed top-0 left-64 right-0 bg-white px-8 py-4 border-b border-gray-200 z-50">
      
      <div className="flex items-center justify-between">
        
        <div className="w-125">
          <input
            type="text"
            placeholder="Search requests..."
            className="w-full rounded-full bg-gray-100 px-5 py-3 outline-none border border-gray-200 focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          
          {/* Notification Icon */}
          <button className="relative text-gray-600 hover:text-black transition">
            <Bell size={22} />
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-300"></div>

          {/* User Profile */}
          <div className="flex items-center gap-3 cursor-pointer">
            <img
              src="https://i.pravatar.c/40"
              alt="profile"
              className="w-10 h-10 rounded-full object-cover"
            />

            <h3 className="font-medium text-gray-800">
              User Name
            </h3>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
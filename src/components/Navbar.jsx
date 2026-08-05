import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Mail,
  Search,
  Settings,
  User,
  Lock,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);

    return () =>
      document.removeEventListener("mousedown", close);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-64 right-0 h-18 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-30">
      {/* Search */}
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

      {/* Right */}
      <div className="flex items-center gap-5">

        <button className="text-gray-600 hover:text-orange-500">
          <Settings size={20} />
        </button>

        <button className="text-gray-600 hover:text-orange-500">
          <Mail size={20} />
        </button>

        <button className="relative text-gray-600 hover:text-orange-500">
          <Bell size={20} />

          <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
        </button>

        {/* Profile */}
        <div
          className="relative border-l pl-5"
          ref={dropdownRef}
        >
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3"
          >
            <img
              src="https://i.pravatar.cc/100?img=12"
              alt=""
              className="w-10 h-10 rounded-full border object-cover"
            />

            <div className="text-left">
              <h3 className="text-sm font-semibold">
                Lucky
              </h3>

              <p className="text-xs text-gray-500">
                Employee
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`transition ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-4 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">

              {/* User */}
              <div className="px-5 py-4 border-b">
                <p className="font-semibold text-[#0F265C]">
                  Lucky
                </p>

                <p className="text-sm text-gray-500">
                  lucky@gmail.com
                </p>
              </div>

              {/* My Profile */}
              <button
                onClick={() => {
                  navigate("/profile");
                  setOpen(false);
                }}
                className="w-full px-5 py-3 flex items-center gap-3 hover:bg-orange-50 text-gray-700"
              >
                <User size={18} />
                My Profile
              </button>

              {/* Update Password */}
              <button
                onClick={() => {
                  navigate("/profile?tab=password");
                  setOpen(false);
                }}
                className="w-full px-5 py-3 flex items-center gap-3 hover:bg-orange-50 text-gray-700"
              >
                <Lock size={18} />
                Update Password
              </button>

              <div className="border-t"></div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full px-5 py-3 flex items-center gap-3 text-red-500 hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>

            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
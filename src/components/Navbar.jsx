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

import { logout as logoutApi } from "../services/loginAPI";
import { getFileUrl } from "../services/profileApi";
import { getInitials, getAvatarColor } from "../utils/avatar";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, roles, profileImage, refreshUser, clearUser } = useAuth();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // =========================================================
  // Load Logged-in User's Full Profile (GET /auth/me)
  // =========================================================
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================
  // Close Dropdown When Click Outside
  // =========================================================
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // =========================================================
  // Logout
  // =========================================================
  const handleLogout = () => {
    logoutApi();
    clearUser();
    navigate("/");
  };

  // =========================================================
  // User Details (from GET /auth/me via AuthContext)
  // =========================================================
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const email = user?.email || "No email";
  const phone = user?.phone || "Not available";
  const roleName = roles?.[0]?.roleName || "Not assigned";
  const status = user?.status === "0" ? "Inactive" : "Active";

  const avatarUrl = getFileUrl(profileImage?.fileURL);
  const initials = getInitials(firstName, lastName);
  const avatarColor = getAvatarColor(email);

  const Avatar = ({ size }) =>
    avatarUrl ? (
      <img
        src={avatarUrl}
        alt={fullName}
        className="rounded-full border object-cover"
        style={{ width: size, height: size }}
      />
    ) : (
      <div
        className="rounded-full border flex items-center justify-center text-white font-semibold"
        style={{ width: size, height: size, backgroundColor: avatarColor }}
      >
        {initials}
      </div>
    );

  return (
    <nav className="fixed top-0 left-64 right-0 h-18 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-30">
      {/* Search */}
      <div className="relative w-[320px]">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search in HRMS"
          className="w-full h-11 pl-12 pr-4 rounded-lg border border-gray-200 bg-[#FAFAFA] outline-none focus:border-orange-400"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">
        <button className="text-gray-600 hover:text-orange-500">
          <Settings size={20} />
        </button>

        <button className="text-gray-600 hover:text-orange-500">
          <Mail size={20} />
        </button>

        <button className="relative text-gray-600 hover:text-orange-500">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full" />
        </button>

        {/* Profile */}
        <div className="relative border-l pl-5" ref={dropdownRef}>
          <button onClick={() => setOpen(!open)} className="flex items-center gap-3">
            <Avatar size={40} />

            <div className="text-left">
              <h3 className="text-sm font-semibold">{fullName}</h3>
              <p className="text-xs text-gray-500">{roleName}</p>
            </div>

            <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-4 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <Avatar size={56} />

                  <div className="min-w-0">
                    <p className="font-semibold text-[#0F265C] text-base truncate">{fullName}</p>
                    <p className="text-sm text-gray-500 truncate">{email}</p>
                    <p className="text-xs text-orange-500 mt-1">{roleName}</p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 space-y-3">
                <div className="flex justify-between gap-4">
                  <span className="text-xs text-gray-500">Email</span>
                  <span className="text-sm font-medium text-gray-700 text-right break-all">
                    {email}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-xs text-gray-500">Phone</span>
                  <span className="text-sm font-medium text-gray-700 text-right">{phone}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-xs text-gray-500">Role</span>
                  <span className="text-sm font-medium text-gray-700 text-right">{roleName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Status</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>

              <div className="border-t">
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

                <button
                  onClick={handleLogout}
                  className="w-full px-5 py-3 flex items-center gap-3 text-red-500 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
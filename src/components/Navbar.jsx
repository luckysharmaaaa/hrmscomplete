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
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { logout as logoutApi } from "../services/loginAPI";
import { getFileUrl } from "../services/profileApi";
import { getInitials, getAvatarColor } from "../utils/avatar";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, roles, profileImage, refreshUser, clearUser } = useAuth();
  const { toggle, collapsed } = useSidebar();

  const [open, setOpen] = useState(false);
  // Phone-only: the search field is hidden by default and expands over
  // the bar when tapped, so the header never overflows on a 360px screen.
  const [searchOpen, setSearchOpen] = useState(false);
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
        className="rounded-full border object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    ) : (
      <div
        className="rounded-full border flex items-center justify-center text-white font-semibold shrink-0"
        style={{ width: size, height: size, backgroundColor: avatarColor }}
      >
        {initials}
      </div>
    );

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-18 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 z-30 transition-all duration-300 ${
        collapsed ? "lg:left-[76px]" : "lg:left-60"
      }`}
    >
      {/* Left: hamburger (below lg) + search */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={toggle}
          className="lg:hidden w-10 h-10 shrink-0 flex items-center justify-center rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Search — full field from sm up, expandable overlay on phones */}
        <div className="relative hidden sm:block w-full max-w-[320px]">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search in HRMS"
            className="w-full h-11 pl-12 pr-4 rounded-lg border border-gray-200 bg-[#FAFAFA] text-sm outline-none focus:border-orange-400"
          />
        </div>

        {/* Phone search trigger */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="sm:hidden w-10 h-10 shrink-0 flex items-center justify-center rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors"
          aria-label="Search"
        >
          <Search size={19} />
        </button>

        {/* Phone search overlay */}
        {searchOpen && (
          <div className="sm:hidden absolute inset-x-0 top-0 h-18 bg-white px-4 flex items-center gap-2 z-40">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                autoFocus
                type="text"
                placeholder="Search in HRMS"
                className="w-full h-11 pl-12 pr-4 rounded-lg border border-gray-200 bg-[#FAFAFA] text-sm outline-none focus:border-orange-400"
              />
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50"
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-1 sm:gap-3 lg:gap-4 shrink-0">
        {/* Secondary icons hide first as width shrinks — they're the least
            important controls in the bar. */}
        <button className="hidden md:flex w-9 h-9 items-center justify-center rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors">
          <Settings size={19} />
        </button>

        <button className="hidden md:flex w-9 h-9 items-center justify-center rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors">
          <Mail size={19} />
        </button>

        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors">
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 bg-red-500 w-2 h-2 rounded-full" />
        </button>

        {/* Profile */}
        <div
          className="relative sm:pl-4 sm:ml-1 sm:border-l border-gray-200"
          ref={dropdownRef}
        >
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 lg:gap-3 py-1.5 pr-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Avatar size={38} />

            {/* Name block is the first thing to go on narrow screens —
                the avatar alone still identifies the user. */}
            <div className="hidden lg:block text-left leading-tight max-w-[140px]">
              <h3 className="text-sm font-semibold text-gray-800 truncate">
                {fullName}
              </h3>
              <p className="text-xs text-gray-500 truncate">{roleName}</p>
            </div>

            <ChevronDown
              size={16}
              className={`hidden sm:block text-gray-400 transition-transform duration-150 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-[min(20rem,calc(100vw-2rem))] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <Avatar size={52} />

                  <div className="min-w-0">
                    <p className="font-semibold text-[#0F265C] text-base truncate">
                      {fullName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{email}</p>
                    <p className="text-xs text-orange-500 mt-1 font-medium">
                      {roleName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 space-y-3">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-xs text-gray-500 shrink-0">Email</span>
                  <span className="text-sm font-medium text-gray-700 text-right break-all">
                    {email}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <span className="text-xs text-gray-500 shrink-0">Phone</span>
                  <span className="text-sm font-medium text-gray-700 text-right">
                    {phone}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <span className="text-xs text-gray-500 shrink-0">Role</span>
                  <span className="text-sm font-medium text-gray-700 text-right">
                    {roleName}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <span className="text-xs text-gray-500 shrink-0">Status</span>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setOpen(false);
                  }}
                  className="w-full px-5 py-3 flex items-center gap-3 text-sm hover:bg-orange-50 text-gray-700 transition-colors"
                >
                  <User size={18} className="shrink-0" />
                  My Profile
                </button>

                <button
                  onClick={() => {
                    navigate("/profile?tab=password");
                    setOpen(false);
                  }}
                  className="w-full px-5 py-3 flex items-center gap-3 text-sm hover:bg-orange-50 text-gray-700 transition-colors"
                >
                  <Lock size={18} className="shrink-0" />
                  Update Password
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full px-5 py-3 flex items-center gap-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} className="shrink-0" />
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
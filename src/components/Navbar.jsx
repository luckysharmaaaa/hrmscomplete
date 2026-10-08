import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Search,
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
import { getInitials } from "../utils/avatar";
import { useAuth } from "../context/authValue";
import { useSidebar } from "../context/sidebarValue";

// Wire this to your notifications API. The orange badge only shows when it is above 0.
const UNREAD_NOTIFICATIONS = 0;

const searchInputCls =
  "hr-input pl-10";

function Navbar() {
  const navigate = useNavigate();

  const { user, profile, refreshUser, clearUser } = useAuth();
  const roles = profile?.roles;
  const profileImage = profile?.profileImage;

  const { toggle, toggleCollapsed, collapsed } = useSidebar();

  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleLogout = () => {
    logoutApi();
    clearUser();
    navigate("/");
  };

  // Desktop: collapse / expand the sidebar. Mobile: open the slide-in menu.
  const handleMenuClick = () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      toggleCollapsed();
    } else {
      toggle();
    }
  };

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || "User";
  const email = user?.email || "No email";
  const phone = user?.phone || "Not available";
  const roleName = roles?.[0]?.roleName || "Not assigned";
  const status = user?.status === "0" ? "Inactive" : "Active";

  const avatarUrl = getFileUrl(profileImage?.fileURL);
  const initials = getInitials(firstName, lastName);

  // Brand-orange avatar (photo when the user has one)
  const renderAvatar = (size) =>
    avatarUrl ? (
      <img
        src={avatarUrl}
        alt={fullName}
        className="shrink-0 rounded-full object-cover ring-2 ring-border-subtle"
        style={{ width: size, height: size }}
      />
    ) : (
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-accent-500 font-semibold text-white ring-2 ring-border-subtle"
        style={{ width: size, height: size, fontSize: size * 0.36 }}
      >
        {initials}
      </div>
    );

  const iconBtn =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors duration-fast ease-standard hover:bg-gray-100 hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600";

  return (
    // left offset kept in sync with Sidebar.jsx: 288px expanded (lg:left-72) / 80px collapsed (lg:left-20)
    <nav
      className={`fixed left-0 right-0 top-0 z-30 flex h-18 items-center justify-between gap-3 border-b border-border-subtle bg-surface px-4 text-text-primary transition-all duration-base ease-standard sm:px-6 lg:px-8 ${
        collapsed ? "lg:left-20" : "lg:left-72"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={handleMenuClick}
          className={iconBtn}
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>

        <span className="hidden h-7 w-px bg-border-strong sm:block" aria-hidden="true" />

        <div className="relative hidden w-full max-w-[420px] sm:block">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled"
          />
          <input
            type="text"
            placeholder="Search in HRMS..."
            aria-label="Search in HRMS"
            className={searchInputCls}
          />
        </div>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className={`${iconBtn} sm:hidden`}
          aria-label="Search"
        >
          <Search size={19} />
        </button>

        {searchOpen && (
          <div className="absolute inset-x-0 top-0 z-40 flex h-18 items-center gap-2 border-b border-border-subtle bg-surface px-4 sm:hidden">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled"
              />
              <input
                autoFocus
                type="text"
                placeholder="Search in HRMS..."
                aria-label="Search in HRMS"
                className={searchInputCls}
              />
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className={iconBtn}
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <button
          type="button"
          className={`${iconBtn} relative`}
          aria-label={
            UNREAD_NOTIFICATIONS > 0
              ? `Notifications, ${UNREAD_NOTIFICATIONS} unread`
              : "Notifications"
          }
        >
          <Bell size={22} />

          {UNREAD_NOTIFICATIONS > 0 && (
            <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
              {UNREAD_NOTIFICATIONS}
            </span>
          )}
        </button>

        {/* Profile menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex items-center gap-3 rounded-lg py-1.5 pl-1.5 pr-2 transition-colors duration-fast ease-standard hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600"
          >
            {renderAvatar(42)}

            <div className="hidden max-w-[150px] text-left leading-tight lg:block">
              <h3 className="truncate text-sm font-semibold text-text-primary">{fullName}</h3>
              <p className="truncate text-xs text-text-secondary">{roleName}</p>
            </div>

            <ChevronDown
              size={18}
              className={`hidden text-text-secondary transition-transform duration-fast ease-standard sm:block ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border-subtle bg-surface text-text-primary shadow-lg"
            >
              <div className="border-b border-border-subtle bg-background px-5 py-4">
                <div className="flex items-center gap-3">
                  {renderAvatar(52)}

                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-primary-700">{fullName}</p>
                    <p className="truncate text-sm text-text-secondary">{email}</p>
                    <p className="mt-1 text-xs font-medium text-accent-600">{roleName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="shrink-0 text-xs text-text-secondary">Email</span>
                  <span className="break-all text-right text-sm font-medium">{email}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="shrink-0 text-xs text-text-secondary">Phone</span>
                  <span className="text-right text-sm font-medium">{phone}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="shrink-0 text-xs text-text-secondary">Role</span>
                  <span className="text-right text-sm font-medium">{roleName}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="shrink-0 text-xs text-text-secondary">Status</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      status === "Active"
                        ? "bg-success-50 text-success-600"
                        : "bg-background text-text-secondary"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>

              <div className="border-t border-border-subtle">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    navigate("/profile");
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-5 py-3 text-sm transition-colors duration-fast ease-standard hover:bg-primary-50"
                >
                  <User size={18} className="shrink-0" />
                  My Profile
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    navigate("/profile?tab=password");
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-5 py-3 text-sm transition-colors duration-fast ease-standard hover:bg-primary-50"
                >
                  <Lock size={18} className="shrink-0" />
                  Update Password
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-5 py-3 text-sm text-danger-500 transition-colors duration-fast ease-standard hover:bg-danger-50"
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
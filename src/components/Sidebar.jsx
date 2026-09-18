import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/loginAPI";
import { useSidebar } from "../context/SidebarContext";
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  CalendarCheck,
  ClipboardList,
  ClipboardCheck,
  CalendarClock,
  Settings2,
  Users,
  ShieldCheck,
  UserCircle,
  BadgeCheck,
  LogOut,
  Home,
  Layers,
  Building2,
  Briefcase,
  ClipboardEdit,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { open, close, collapsed, toggleCollapsed } = useSidebar();

  const isActive = (path) => location.pathname === path;

  const activeClass =
    "bg-orange-50 text-orange-500 border-l-4 border-orange-500 font-semibold";

  // `lg:hidden` on the label is the trick that makes the rail responsive
  // to BOTH signals correctly: below `lg` the mobile drawer always shows
  // full labels (the class simply doesn't apply), and at `lg`+ the label
  // disappears only when `collapsed` is true.
  const labelCls = collapsed ? "lg:hidden" : "";
  const justifyCls = collapsed ? "lg:justify-center" : "";

  const navItem = (path, extraClass = "") =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${justifyCls} ${extraClass} ${
      isActive(path)
        ? activeClass
        : "text-gray-800 hover:bg-orange-50 hover:text-orange-500"
    }`;

  const subNavItem = (path, extraClass = "") =>
    `block px-4 py-2 rounded-lg text-[13px] transition-all duration-150 ${extraClass} ${
      isActive(path)
        ? activeClass
        : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
    }`;

  const subLink = (path) =>
    `flex items-center gap-3 pl-8 pr-4 py-2 rounded-lg text-[13px] transition-all duration-150 ${
      isActive(path)
        ? activeClass
        : "text-gray-500 hover:bg-orange-50 hover:text-orange-500"
    }`;

  const handleLogout = () => {
    logout(); // remove token and user
    navigate("/");
  };

  // A group header (Attendance / Employees) normally opens its own
  // accordion via the hidden checkbox. In rail mode there's no room to
  // show the accordion content at all, so a click there should instead
  // expand the whole sidebar back to full width — not silently do
  // nothing, which is what "collapsed but still clickable" would feel
  // like otherwise.
  const handleGroupCheckboxClick = (e) => {
    if (collapsed) {
      e.preventDefault();
      toggleCollapsed();
    }
  };

  return (
    <>
      {/* ── Backdrop (mobile / tablet drawer only) ── */}
      <div
        onClick={close}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── Sidebar ──
          Below lg : off-canvas drawer, full width (w-64), slides in/out.
          lg+      : docked. 240px expanded (w-60) — narrower than the
                     256px default, which is the "less breadth" fix —
                     or a 76px icon-only rail when collapsed. */}
      <aside
        className={`h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-50 overflow-visible flex flex-col shadow-sm
          transition-all duration-300 ease-in-out
          w-64 ${collapsed ? "lg:w-[76px]" : "lg:w-60"}
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
      >
        {/* ── Collapse toggle — desktop only, sits on the sidebar's edge
              like Notion/Linear/Vercel's rail toggle. ── */}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-gray-400 hover:text-orange-500 hover:border-orange-200 transition z-10"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* ── Logo ── */}
        <div
          className={`h-18 border-b border-gray-100 shrink-0 flex items-center justify-center px-6 relative ${
            collapsed ? "lg:justify-center lg:px-2" : ""
          }`}
        >
          <Link to="/dashboard" className="shrink-0">
            <img
              src={
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAELKul0RWF1DETWIo4sQbDSdQSMas6MlqGT2LGAtAsg&s"
              }
              alt="Logo"
              className={`object-contain hover:scale-105 transition-transform duration-200 cursor-pointer mix-blend-multiply ${
                collapsed
                  ? "h-14 w-14 lg:h-8 lg:w-8"
                  : "h-14 w-auto max-w-full"
              }`}
            />
          </Link>

          {/* Close button — mobile drawer only */}
          <button
            type="button"
            onClick={close}
            className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto overflow-x-hidden">
          <p
            className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-3 ${labelCls}`}
          >
            Main Menu
          </p>

          <ul className="space-y-1">
            {/* Dashboard */}
            <li>
              <Link
                to="/dashboard"
                title={collapsed ? "Dashboard" : undefined}
                className={navItem("/dashboard")}
              >
                <LayoutDashboard size={18} className="shrink-0" />
                <span className={labelCls}>Dashboard</span>
              </Link>
            </li>

            {/* ── Attendance (Parent Collapse) ── */}
            <li>
              <div className="collapse collapse-arrow bg-white rounded-lg">
                <input
                  type="checkbox"
                  defaultChecked
                  onClick={handleGroupCheckboxClick}
                />

                <div
                  title={collapsed ? "Attendance" : undefined}
                  className={`collapse-title flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-800 min-h-0 ${justifyCls}`}
                >
                  <FileText size={18} className="shrink-0 text-gray-500" />
                  <span className={labelCls}>Attendance</span>
                </div>

                <div className={`collapse-content p-0 ${collapsed ? "lg:hidden" : ""}`}>
                  <ul className="space-y-1 pb-1">
                    {/* ── Leave (Child Collapse) ── */}
                    <li>
                      <div className="collapse collapse-arrow bg-white rounded-lg">
                        <input type="checkbox" defaultChecked />

                        <div className="collapse-title flex items-center gap-3 pl-8 pr-4 py-2 text-[13px] font-medium text-gray-500 min-h-0">
                          <ClipboardList size={15} className="shrink-0" />
                          Leave
                        </div>

                        <div className="collapse-content p-0">
                          <ul className="ml-8 border-l-2 border-gray-100 pl-3 space-y-1 pb-1">
                            <li>
                              <Link
                                to="/leave-admin"
                                className={subNavItem("/leave-admin")}
                              >
                                <span className="flex items-center gap-2">
                                  <ClipboardCheck
                                    size={13}
                                    className="shrink-0 opacity-60"
                                  />
                                  Leave (Admin)
                                </span>
                              </Link>
                            </li>
                            <li>
                              <Link
                                to="/leave-employee"
                                className={subNavItem("/leave-employee")}
                              >
                                <span className="flex items-center gap-2">
                                  <CalendarClock
                                    size={13}
                                    className="shrink-0 opacity-60"
                                  />
                                  Leave (Employee)
                                </span>
                              </Link>
                            </li>
                            <li>
                              <Link
                                to="/leave-setting"
                                className={subNavItem("/leave-setting")}
                              >
                                <span className="flex items-center gap-2">
                                  <Settings2
                                    size={13}
                                    className="shrink-0 opacity-60"
                                  />
                                  Leave Settings
                                </span>
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </li>

                    {/* Attendance Admin */}
                    <li>
                      <Link
                        to="/attendance-admin"
                        className={subLink("/attendance-admin")}
                      >
                        <CalendarCheck size={15} className="shrink-0" />
                        Attendance (Admin)
                      </Link>
                    </li>

                    {/* Attendance Employee */}
                    <li>
                      <Link
                        to="/attendance-employee"
                        className={subLink("/attendance-employee")}
                      >
                        <CalendarDays size={15} className="shrink-0" />
                        Attendance (Employee)
                      </Link>
                    </li>

                    {/* Holiday Calendar */}
                    <li>
                      <Link
                        to="/holiday-calender"
                        className={subLink("/holiday-calender")}
                      >
                        <CalendarDays size={15} className="shrink-0" />
                        Holiday Calendar
                      </Link>
                    </li>

                    {/* WFH Management */}
                    <li>
                      <Link
                        to="/wfh-management"
                        className={subLink("/wfh-management")}
                      >
                        <Home size={15} className="shrink-0" />
                        WFH Management
                      </Link>
                    </li>

                    {/* Regularization (Admin) */}
                    <li>
                      <Link
                        to="/attendance-regularization"
                        className={subLink("/attendance-regularization")}
                      >
                        <ClipboardEdit size={15} className="shrink-0" />
                        Regularization Requests
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </li>

            {/* ── Employees (Parent Collapse) ── */}
            <li>
              <div className="collapse collapse-arrow bg-white rounded-lg">
                <input
                  type="checkbox"
                  defaultChecked
                  onClick={handleGroupCheckboxClick}
                />

                <div
                  title={collapsed ? "Employees" : undefined}
                  className={`collapse-title flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-800 min-h-0 ${justifyCls}`}
                >
                  <Users size={18} className="shrink-0 text-gray-500" />
                  <span className={labelCls}>Employees</span>
                </div>

                <div className={`collapse-content p-0 ${collapsed ? "lg:hidden" : ""}`}>
                  <ul className="space-y-1 pb-1">
                    {/* Employee List */}
                    <li>
                      <Link
                        to="/employee-list"
                        className={subLink("/employee-list")}
                      >
                        <ClipboardList size={15} className="shrink-0" />
                        Employee List
                      </Link>
                    </li>

                    <li>
                      <Link to="/department" className={subLink("/department")}>
                        <Building2 size={15} className="shrink-0" />
                        Department
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/designations"
                        className={subLink("/designations")}
                      >
                        <Briefcase size={15} className="shrink-0" />
                        Designations
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </li>

            {/* Users */}
            <li>
              <Link
                to="/user"
                title={collapsed ? "Users" : undefined}
                className={navItem("/user")}
              >
                <Users size={18} className="shrink-0" />
                <span className={labelCls}>Users</span>
              </Link>
            </li>

            {/* Roles & Permissions
            <li>
              <Link
                to="/rolespermissions"
                className={navItem("/rolespermissions")}
              >
                <ShieldCheck size={18} className="shrink-0" />
                <span className={labelCls}>Roles &amp; Permissions</span>
              </Link>
            </li> */}

            {/* Profile */}
            <li>
              <Link
                to="/profile"
                title={collapsed ? "Profile" : undefined}
                className={navItem("/profile")}
              >
                <UserCircle size={18} className="shrink-0" />
                <span className={labelCls}>Profile</span>
              </Link>
            </li>

            {/* Roles */}
            <li>
              <Link
                to="/roles"
                title={collapsed ? "Roles" : undefined}
                className={navItem("/roles")}
              >
                <BadgeCheck size={18} className="shrink-0" />
                <span className={labelCls}>Roles</span>
              </Link>
            </li>

            {/* Modules */}
            <li>
              <Link
                to="/modules"
                title={collapsed ? "Modules" : undefined}
                className={navItem("/modules")}
              >
                <Layers size={18} className="shrink-0" />
                <span className={labelCls}>Modules</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* ── Logout (pinned to bottom) ── */}
        <div className="shrink-0 px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150 font-medium ${justifyCls}`}
          >
            <LogOut size={18} className="shrink-0" />
            <span className={labelCls}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
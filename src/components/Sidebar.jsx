import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
<<<<<<< HEAD
=======
  Building2,
  Briefcase,
>>>>>>> main
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const activeClass =
    "bg-orange-50 text-orange-500 border-l-4 border-orange-500 font-semibold";

  const navItem = (path, Icon, label, extraClass = "") =>
    `flex items-center gap-3 px-4 py-[9px] rounded-lg text-[13.5px] font-medium transition-all duration-150 ${extraClass} ${
      isActive(path)
        ? activeClass
        : "text-gray-800 hover:bg-orange-50 hover:text-orange-500"
    }`;

  const subNavItem = (path, extraClass = "") =>
    `block px-4 py-[7px] rounded text-[12.5px] transition-all duration-150 ${extraClass} ${
      isActive(path)
        ? activeClass
        : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
    }`;

<<<<<<< HEAD
=======
  const subLink = (path) =>
    `flex items-center gap-3 pl-8 pr-4 py-[7px] rounded-lg text-[13px] transition-all duration-150 ${
      isActive(path)
        ? activeClass
        : "text-gray-500 hover:bg-orange-50 hover:text-orange-500"
    }`;

>>>>>>> main
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 fixed left-0 top-0 overflow-y-auto flex flex-col shadow-sm">
      {/* ── Logo ── */}
      <div className="px-6 py-[10px] border-b border-gray-100 shrink-0 flex justify-center items-center">
        <Link to="/dashboard">
          <img
            src={
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAELKul0RWF1DETWIo4sQbDSdQSMas6MlqGT2LGAtAsg&s"
            }
            alt="Logo"
            className="h-20 w-auto object-contain hover:scale-105 transition-transform duration-200 cursor-pointer mix-blend-multiply"
          />
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
<<<<<<< HEAD
        {/* Section label */}
=======
>>>>>>> main
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">
          Main Menu
        </p>

        <ul className="space-y-[3px]">
          {/* Dashboard */}
          <li>
            <Link
              to="/dashboard"
              className={navItem("/dashboard", LayoutDashboard, "Dashboard")}
            >
              <LayoutDashboard size={17} className="shrink-0" />
              Dashboard
            </Link>
          </li>

          {/* ── Attendance (Parent Collapse) ── */}
          <li>
            <div className="collapse collapse-arrow bg-white rounded-lg">
              <input type="checkbox" defaultChecked />

              <div className="collapse-title flex items-center gap-3 px-4 py-[9px] text-[13.5px] font-medium text-gray-800 min-h-0">
                <FileText size={17} className="shrink-0 text-gray-500" />
                Attendance
              </div>

              <div className="collapse-content p-0">
                <ul className="space-y-[2px] pb-1">
                  {/* ── Leave (Child Collapse) ── */}
                  <li>
                    <div className="collapse collapse-arrow bg-white rounded-lg">
                      <input type="checkbox" defaultChecked />

                      <div className="collapse-title flex items-center gap-3 pl-8 pr-4 py-[7px] text-[13px] font-medium text-gray-500 min-h-0">
                        <ClipboardList size={15} className="shrink-0" />
                        Leave
                      </div>

                      <div className="collapse-content p-0">
                        <ul className="ml-8 border-l-2 border-gray-100 pl-3 space-y-[2px] pb-1">
<<<<<<< HEAD
                          {/* leave-admin*/}
=======
>>>>>>> main
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
<<<<<<< HEAD
                                {"Leave(Admin)"}
                              </span>
                            </Link>
                          </li>

                          {/* Leave Employee */}
=======
                                Leave(Admin)
                              </span>
                            </Link>
                          </li>
>>>>>>> main
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
                                Leave(Employee)
                              </span>
                            </Link>
                          </li>
<<<<<<< HEAD

                          {/* Leave Settings */}
=======
>>>>>>> main
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
<<<<<<< HEAD
                      className={`flex items-center gap-3 pl-8 pr-4 py-[7px] rounded-lg text-[13px] transition-all duration-150 ${
                        isActive("/attendance-admin")
                          ? activeClass
                          : "text-gray-500 hover:bg-orange-50 hover:text-orange-500"
                      }`}
=======
                      className={subLink("/attendance-admin")}
>>>>>>> main
                    >
                      <CalendarCheck size={15} className="shrink-0" />
                      Attendance (Admin)
                    </Link>
                  </li>

                  {/* Attendance Employee */}
                  <li>
                    <Link
                      to="/attendance-employee"
<<<<<<< HEAD
                      className={`flex items-center gap-3 pl-8 pr-4 py-[7px] rounded-lg text-[13px] transition-all duration-150 ${
                        isActive("/attendance-employee")
                          ? activeClass
                          : "text-gray-500 hover:bg-orange-50 hover:text-orange-500"
                      }`}
=======
                      className={subLink("/attendance-employee")}
>>>>>>> main
                    >
                      <CalendarDays size={15} className="shrink-0" />
                      Attendance (Employee)
                    </Link>
                  </li>

                  {/* Holiday Calendar */}
                  <li>
                    <Link
                      to="/holiday-calender"
<<<<<<< HEAD
                      className={`flex items-center gap-3 pl-8 pr-4 py-[7px] rounded-lg text-[13px] transition-all duration-150 ${
                        isActive("/holiday-calender")
                          ? activeClass
                          : "text-gray-500 hover:bg-orange-50 hover:text-orange-500"
                      }`}
=======
                      className={subLink("/holiday-calender")}
>>>>>>> main
                    >
                      <CalendarDays size={15} className="shrink-0" />
                      Holiday Calendar
                    </Link>
                  </li>

                  {/* WFH Management */}
                  <li>
                    <Link
                      to="/wfh-management"
<<<<<<< HEAD
                      className={`flex items-center gap-3 pl-8 pr-4 py-[7px] rounded-lg text-[13px] transition-all duration-150 ${
                        isActive("/wfh-management")
                          ? activeClass
                          : "text-gray-500 hover:bg-orange-50 hover:text-orange-500"
                      }`}
=======
                      className={subLink("/wfh-management")}
>>>>>>> main
                    >
                      <Home size={15} className="shrink-0" />
                      WFH Management
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </li>

<<<<<<< HEAD
=======
          {/* ── Employees (Parent Collapse) ── */}
          <li>
            <div className="collapse collapse-arrow bg-white rounded-lg">
              <input type="checkbox" defaultChecked />

              <div className="collapse-title flex items-center gap-3 px-4 py-[9px] text-[13.5px] font-medium text-gray-800 min-h-0">
                <Users size={17} className="shrink-0 text-gray-500" />
                Employees
              </div>

              <div className="collapse-content p-0">
                <ul className="space-y-[2px] pb-1">
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
                    <Link to="/designations" className={subLink("/designations")}>
                      <Briefcase size={15} className="shrink-0" />
                      Designations
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </li>

>>>>>>> main
          {/* Users */}
          <li>
            <Link to="/user" className={navItem("/user", Users, "Users")}>
              <Users size={17} className="shrink-0" />
              Users
            </Link>
          </li>

          {/* Roles & Permissions */}
          <li>
            <Link
              to="/rolespermissions"
              className={navItem(
                "/rolespermissions",
                ShieldCheck,
                "Roles & Permissions",
              )}
            >
              <ShieldCheck size={17} className="shrink-0" />
              Roles &amp; Permissions
            </Link>
          </li>

          {/* Profile */}
          <li>
            <Link
              to="/profile"
              className={navItem("/profile", UserCircle, "Profile")}
            >
              <UserCircle size={17} className="shrink-0" />
              Profile
            </Link>
          </li>

          {/* Roles */}
          <li>
            <Link
              to="/roles"
              className={navItem("/roles", BadgeCheck, "Roles")}
            >
              <BadgeCheck size={17} className="shrink-0" />
              Roles
            </Link>
          </li>

          {/* Modules */}
          <li>
            <Link
              to="/modules"
              className={navItem("/modules", Layers, "Modules")}
            >
              <Layers size={17} className="shrink-0" />
              Modules
            </Link>
          </li>
        </ul>
      </nav>

      {/* ── Logout (pinned to bottom) ── */}
      <div className="shrink-0 px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-4 py-[9px] rounded-lg text-[13.5px] text-red-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150 font-medium"
        >
          <LogOut size={17} className="shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

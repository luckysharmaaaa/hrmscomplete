import { lazy } from "react";

// ── Existing pages: path + module slug (permission = "<slug>:view") ─────────
import User from "./User";
import Roles from "./Roles";
import Modules from "./Modules";
import RolePermissions from "./RolePermissions";
import LeaveAdmin from "./LeaveAdmin";
import LeaveEmployee from "./LeaveEmployee";
import LeaveSetting from "./LeaveSetting";
import AttendanceAdmin from "./AttendanceAdmin";
import AttendanceEmployee from "./AttendanceEmployee";
import AttendanceRegularizationAdmin from "./AttendanceRegularizationAdmin";
import HolidayCalender from "./HolidayCalender";
import WfhManagement from "./WfhManagement";
import MyWfh from "./Mywfh";
import EmployeeList from "./EmployeeList";
import EmployeeDetail from "./EmployeeDetail";
import Designation from "./Designation";
import Department from "./Department";

export const BUILT_IN_PAGES = [
  { path: "/user", slug: "users", Component: User },
  { path: "/roles", slug: "roles", Component: Roles },
  { path: "/modules", slug: "modules", Component: Modules },
  { path: "/role-permissions", slug: "role-permissions", Component: RolePermissions },
  { path: "/leave-admin", slug: "leave-admin", Component: LeaveAdmin },
  { path: "/leave-employee", slug: "leave-employee", Component: LeaveEmployee },
  { path: "/leave-setting", slug: "leave-settings", Component: LeaveSetting },
  { path: "/attendance-admin", slug: "attendance-admin", Component: AttendanceAdmin },
  { path: "/attendance-employee", slug: "attendance-employee", Component: AttendanceEmployee },
  { path: "/attendance-regularization", slug: "attendance-regularization", Component: AttendanceRegularizationAdmin },
  { path: "/holiday-calender", slug: "holiday-calendar", Component: HolidayCalender },
  { path: "/wfh-management", slug: "wfh-management", Component: WfhManagement },
  { path: "/my-wfh", slug: "my-wfh", Component: MyWfh },
  { path: "/employee-list", slug: "employee-list", Component: EmployeeList },
  { path: "/employee/:id", slug: "employee-list", Component: EmployeeDetail },
  { path: "/designations", slug: "designations", Component: Designation },
  { path: "/department", slug: "department", Component: Department },
];

export const BUILT_IN_PATHS = new Set(BUILT_IN_PAGES.map((p) => p.path));

// ── NEW modules: drop a file in src/pages/modules/<slug>.jsx ────────────────
// e.g. a "payroll" module -> src/pages/modules/payroll.jsx (default export).
// No change to App.jsx / Sidebar.jsx / routes is ever needed. A module with no
// page file yet renders <ModulePlaceholder />.
const discovered = import.meta.glob("./modules/*.jsx");
const cache = new Map();

export const getDynamicPage = (slug) => {
  if (cache.has(slug)) return cache.get(slug);
  const loader = discovered[`./modules/${slug}.jsx`];
  const Component = loader ? lazy(loader) : null;
  cache.set(slug, Component);
  return Component;
};

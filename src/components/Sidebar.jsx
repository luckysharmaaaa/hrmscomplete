import React, { useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/loginAPI";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, CalendarCheck, CalendarDays, ClipboardCheck, CalendarClock, Settings2, Home,
  ClipboardEdit, Users, Building2, Briefcase, ClipboardList, ShieldCheck, UserCircle, BadgeCheck,
  Layers, LogOut, X, ChevronDown, ChevronLeft, ChevronRight, Laptop, Circle, FileText, Wallet,
  Banknote, Receipt, Calculator, BarChart3, FileSpreadsheet, UserPlus, UserCheck, Clock, Settings,
  Folder, Package, Truck, ShoppingCart, CreditCard, Landmark, Bell, Mail, Megaphone, GraduationCap,
  Award, Target, Shield, Key, Lock, Network, Workflow, Calendar,
} from "lucide-react";

import companyLogo from "../assets/images/logo.png";

// Icon NAME stored in modules.icon -> lucide component (unknown names fall back to a dot).
const ICONS = {
  LayoutDashboard, CalendarCheck, CalendarDays, ClipboardCheck, CalendarClock, Settings2, Home,
  ClipboardEdit, Users, Building2, Briefcase, ClipboardList, ShieldCheck, UserCircle, BadgeCheck,
  Layers, Laptop, FileText, Wallet, Banknote, Receipt, Calculator, BarChart3, FileSpreadsheet,
  UserPlus, UserCheck, Clock, Settings, Folder, Package, Truck, ShoppingCart, CreditCard, Landmark,
  Bell, Mail, Megaphone, GraduationCap, Award, Target, Shield, Key, Lock, Network, Workflow, Calendar,
};
const iconFor = (name) => ICONS[name] || Circle;

// Core pages every signed-in user has (not permission modules in the menu)
const CORE_SLUGS = ["dashboard", "profile"];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { open, close, collapsed, toggleCollapsed } = useSidebar();
  const { menu, permissionsLoaded } = useAuth();

  const isActive = (path) => location.pathname === path;
  const labelCls = collapsed ? "lg:hidden" : "";
  const justifyCls = collapsed ? "lg:justify-center" : "";

  const topItem = (path) =>
    `group flex items-center gap-3 h-11 px-3.5 rounded-md text-sm font-medium transition-colors duration-fast ease-standard ${justifyCls} ${isActive(path)
      ? "bg-primary-50 text-primary-700 border-l-[3px] border-accent-500"
      : "text-text-secondary border-l-[3px] border-transparent hover:bg-primary-50 hover:text-primary-700"
    }`;

  const childItem = (path) =>
    `flex items-center gap-2.5 h-10 pl-[46px] pr-3.5 rounded-md text-[13.5px] transition-colors duration-fast ease-standard ${isActive(path)
      ? "bg-primary-50 text-primary-700 font-medium"
      : "text-text-secondary hover:bg-primary-50 hover:text-primary-700"
    }`;

  const groupHeader =
    "flex items-center justify-between h-11 px-3.5 rounded-md text-sm font-medium text-text-primary cursor-pointer hover:bg-primary-50 hover:text-primary-700 transition-colors duration-fast ease-standard";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleGroupClick = (e) => {
    if (collapsed) {
      e.preventDefault();
      toggleCollapsed();
    }
  };

  // Build the sidebar from the DB menu (modules the user can "view"):
  //  - a module without a path = group header with its pages inside
  //  - a module with a path    = a normal link
  const { items, profileModuleId } = useMemo(() => {
    const all = (menu || []).filter((m) => !CORE_SLUGS.includes(m.slug));
    const ids = new Set(all.map((m) => m.id));
    const byParent = new Map();
    all.forEach((m) => {
      const key = m.parentId && ids.has(m.parentId) ? m.parentId : 0;
      byParent.set(key, [...(byParent.get(key) || []), m]);
    });
    const leaves = (id) =>
      (byParent.get(id) || []).flatMap((c) => [...(c.navigable ? [c] : []), ...leaves(c.id)]);

    const out = [];
    (byParent.get(0) || []).forEach((root) => {
      const kids = leaves(root.id);
      if (root.navigable) {
        out.push({ type: "link", ...root });
        kids.forEach((k) => out.push({ type: "link", ...k }));
      } else if (kids.length) {
        out.push({ type: "group", ...root, children: kids });
      }
    });

    const profile = (menu || []).find((m) => m.slug === "profile");
    return { items: out, profileModuleId: profile?.id ?? 17 };
  }, [menu]);

  const renderLink = (item) => {
    const Icon = iconFor(item.icon);
    return (
      <li key={`l-${item.id}`}>
        <Link to={item.path} title={collapsed ? item.name : undefined} className={topItem(item.path)}>
          <Icon size={18} className="shrink-0" />
          <span className={labelCls}>{item.name}</span>
        </Link>
      </li>
    );
  };

  const renderGroup = (group) => {
    const GroupIcon = iconFor(group.icon);
    return (
      <li key={`g-${group.id}`}>
        <details className="group" open>
          <summary
            onClick={handleGroupClick}
            title={collapsed ? group.name : undefined}
            className={`${groupHeader} ${justifyCls} list-none`}
          >
            <span className="flex items-center gap-3">
              <GroupIcon size={18} className="shrink-0" />
              <span className={labelCls}>{group.name}</span>
            </span>
            <ChevronDown
              size={14}
              className={`shrink-0 transition-transform duration-fast ease-standard group-open:rotate-180 ${labelCls}`}
            />
          </summary>

          <ul className={`flex flex-col gap-0.5 mt-0.5 ${collapsed ? "lg:hidden" : ""}`}>
            {group.children.map((child) => {
              const ChildIcon = iconFor(child.icon);
              return (
                <li key={child.id}>
                  <Link to={child.path} className={childItem(child.path)}>
                    <ChildIcon size={14} className="shrink-0" />
                    {child.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </details>
      </li>
    );
  };

  const profileLink = (
    <li key="profile">
      <Link to="/profile" title={collapsed ? "Profile" : undefined} className={topItem("/profile")}>
        <UserCircle size={18} className="shrink-0" />
        <span className={labelCls}>Profile</span>
      </Link>
    </li>
  );

  // Profile keeps its familiar spot (before the access-control items)
  const rendered = [];
  let profileDone = false;
  items.forEach((item) => {
    if (!profileDone && item.id > profileModuleId) {
      rendered.push(profileLink);
      profileDone = true;
    }
    rendered.push(item.type === "group" ? renderGroup(item) : renderLink(item));
  });
  if (!profileDone) rendered.push(profileLink);

  return (
    <>
      <div
        onClick={close}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity duration-base ease-standard ${open ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Expanded: 288px (w-72) Â· Collapsed: 80px (w-20) â€” kept in sync with Navbar.jsx and App.jsx margins */}
      <aside
        className={`h-screen bg-surface border-r border-border-subtle fixed left-0 top-0 z-50 flex flex-col shadow-sm
          transition-all duration-base ease-standard
          w-72 ${collapsed ? "lg:w-20" : "lg:w-72"}
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
      >
        <button
          type="button"
          onClick={toggleCollapsed}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 items-center justify-center rounded-full bg-surface border border-border-subtle shadow-sm text-primary-700 hover:text-accent-500 hover:border-primary-200 transition-colors duration-fast ease-standard z-10"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        <div className="shrink-0 border-b border-border-subtle">
          <div className="h-16 flex items-center justify-center px-5 relative">
            <Link to="/dashboard" className="shrink-0 flex items-center">
              <img
                src={companyLogo}
                alt="Technovatic Solutions"
                className={`object-contain h-11 block ${collapsed ? "lg:hidden" : ""}`}
              />
              {collapsed && (
                <div className="hidden lg:flex h-10 w-10 rounded-lg bg-gradient-brand items-center justify-center shadow-sm">
                  <span className="text-white font-extrabold text-sm leading-none">TS</span>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={close}
              className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-text-secondary hover:bg-primary-50 hover:text-primary-700"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>
          <div className="h-[3px] bg-gradient-brand" />
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
          <p className={`text-[10px] font-semibold text-text-disabled uppercase tracking-wider mb-2 px-3.5 ${labelCls}`}>
            Main Menu
          </p>

          <ul className="flex flex-col gap-0.5">
            <li>
              <Link to="/dashboard" title={collapsed ? "Dashboard" : undefined} className={topItem("/dashboard")}>
                <LayoutDashboard size={18} className="shrink-0" />
                <span className={labelCls}>Dashboard</span>
              </Link>
            </li>

            {/* While permissions load, show a skeleton instead of a wrong menu */}
            {!permissionsLoaded
              ? [0, 1, 2, 3, 4].map((i) => (
                  <li key={`sk-${i}`} className="h-11 px-3.5 flex items-center">
                    <div className="h-4 w-full rounded bg-primary-50 animate-pulse" />
                  </li>
                ))
              : rendered}
          </ul>
        </nav>

        <div className="shrink-0 h-14 px-3 border-t border-border-subtle flex items-center">
          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 h-11 px-3.5 rounded-md text-sm font-medium text-danger-500 hover:bg-danger-50 transition-colors duration-fast ease-standard ${justifyCls}`}
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

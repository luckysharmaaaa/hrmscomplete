import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/sidebarValue";
import { useAuth } from "../context/authValue";
import {
  LayoutDashboard, CalendarCheck, CalendarDays, ClipboardCheck, CalendarClock, Settings2, Home,
  ClipboardEdit, Users, Building2, Briefcase, ClipboardList, ShieldCheck, UserCircle, BadgeCheck,
  Layers, Laptop, FileText, Wallet, Banknote, Receipt, Calculator, BarChart3, FileSpreadsheet,
  UserPlus, UserCheck, Clock, Settings, Folder, Package, Truck, ShoppingCart, CreditCard, Landmark,
  Bell, Mail, Megaphone, GraduationCap, Award, Target, Shield, Key, Lock, Network, Workflow, Calendar,
  User, LayoutGrid, Headset, Circle, X, ChevronDown, ChevronRight,
} from "lucide-react";

import companyLogo from "../assets/images/logo.png"; // the normal (colour) logo, shown on the light sidebar

// Where the "Tech Support" card goes. Replace with your real support link / mailbox.
const SUPPORT_HREF = "mailto:support@technovatic.in";

// Icon NAME stored in modules.icon -> lucide component (unknown names fall back to a dot).
const ICONS = {
  LayoutDashboard, CalendarCheck, CalendarDays, ClipboardCheck, CalendarClock, Settings2, Home,
  ClipboardEdit, Users, Building2, Briefcase, ClipboardList, ShieldCheck, UserCircle, BadgeCheck,
  Layers, Laptop, FileText, Wallet, Banknote, Receipt, Calculator, BarChart3, FileSpreadsheet,
  UserPlus, UserCheck, Clock, Settings, Folder, Package, Truck, ShoppingCart, CreditCard, Landmark,
  Bell, Mail, Megaphone, GraduationCap, Award, Target, Shield, Key, Lock, Network, Workflow, Calendar,
};

// Fixed icons for well-known modules so the menu always looks the same,
// whatever icon name is stored in the DB.
const ICON_BY_SLUG = {
  users: User,
  roles: ShieldCheck,
  "role-permissions": Lock,
  modules: LayoutGrid,
  "leave-settings": Settings,
};

const iconFor = (item) => ICON_BY_SLUG[item.slug] || ICONS[item.icon] || Circle;

// Core pages every signed-in user has (not permission modules in the menu)
const CORE_SLUGS = ["dashboard", "profile"];

function Sidebar() {
  const location = useLocation();
  const { open, close, collapsed, toggleCollapsed } = useSidebar();
  const { menu, permissionsLoaded } = useAuth();

  // Which groups the user opened/closed by hand. Untouched groups open
  // automatically when one of their pages is the current route.
  const [manualOpen, setManualOpen] = useState({});

  const isActive = (path) => location.pathname === path;
  const labelCls = collapsed ? "lg:hidden" : "";
  const justifyCls = collapsed ? "lg:justify-center lg:px-0" : "";

  const itemBase =
    "flex items-center gap-3.5 h-11 px-4 rounded-lg text-[15px] font-medium transition-colors duration-fast ease-standard focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600";

  const topItem = (path) =>
    `${itemBase} ${justifyCls} ${
      isActive(path)
        ? "bg-accent-500/10 text-accent-600"
        : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"
    }`;

  const childItem = (path) =>
    `flex items-center gap-3.5 h-10 pl-[46px] pr-3 rounded-lg text-sm transition-colors duration-fast ease-standard focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600 ${
      isActive(path) ? "bg-accent-500/10 font-medium text-accent-600" : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"
    }`;

  const handleGroupClick = (id, childActive) => {
    if (collapsed) {
      toggleCollapsed(); // expand the sidebar first, like before
      return;
    }
    setManualOpen((prev) => ({ ...prev, [id]: !(prev[id] ?? childActive) }));
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
    const Icon = iconFor(item);
    return (
      <li key={`l-${item.id}`}>
        <Link to={item.path} title={collapsed ? item.name : undefined} className={topItem(item.path)}>
          <Icon size={20} strokeWidth={1.8} className="shrink-0" />
          <span className={labelCls}>{item.name}</span>
        </Link>
      </li>
    );
  };

  const renderGroup = (group) => {
    const GroupIcon = iconFor(group);
    const childActive = group.children.some((c) => isActive(c.path));
    const expanded = manualOpen[group.id] ?? childActive;
    const showChildren = expanded && !collapsed;

    return (
      <li key={`g-${group.id}`}>
        <button
          type="button"
          onClick={() => handleGroupClick(group.id, childActive)}
          aria-expanded={showChildren}
          title={collapsed ? group.name : undefined}
          className={`${itemBase} ${justifyCls} w-full justify-between ${
            expanded ? "text-text-primary" : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"
          }`}
        >
          <span className="flex items-center gap-3.5">
            <GroupIcon size={20} strokeWidth={1.8} className="shrink-0" />
            <span className={labelCls}>{group.name}</span>
          </span>

          <ChevronDown
            size={16}
            className={`shrink-0 text-text-disabled transition-transform duration-fast ease-standard ${
              expanded ? "rotate-180" : ""
            } ${labelCls}`}
          />
        </button>

        {showChildren && (
          <ul className="mt-1 flex flex-col gap-0.5">
            {group.children.map((child) => (
              <li key={child.id}>
                <Link to={child.path} className={childItem(child.path)}>
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      isActive(child.path) ? "bg-accent-500" : "bg-border-strong"
                    }`}
                  />
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  const profileLink = (
    <li key="profile">
      <Link to="/profile" title={collapsed ? "Profile" : undefined} className={topItem("/profile")}>
        <User size={20} strokeWidth={1.8} className="shrink-0" />
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
        className={`fixed inset-0 z-40 bg-primary-900/40 lg:hidden transition-opacity duration-base ease-standard ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Expanded: 288px (w-72) · Collapsed: 80px (w-20) — kept in sync with Navbar.jsx and App.jsx margins */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border-subtle bg-surface
          transition-all duration-base ease-standard
          w-72 ${collapsed ? "lg:w-20" : "lg:w-72"}
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
      >
        {/* Logo — same 72px height as the navbar so the two read as one bar */}
        <div className="relative flex h-18 shrink-0 items-center border-b border-border-subtle px-6">
          <Link to="/dashboard" className="flex items-center">
            <img
              src={companyLogo}
              alt="Technovatic Solutions"
              className={`block h-11 object-contain ${collapsed ? "lg:hidden" : ""}`}
            />
            {collapsed && (
              <div className="hidden h-10 w-10 items-center justify-center rounded-lg bg-accent-500 shadow-sm lg:flex">
                <span className="text-sm font-extrabold leading-none text-white">TS</span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={close}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary hover:bg-gray-100 hover:text-text-primary lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
          <p className={`mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-text-disabled ${labelCls}`}>
            Main Menu
          </p>

          <ul className="flex flex-col gap-1.5">
            <li>
              <Link to="/dashboard" title={collapsed ? "Dashboard" : undefined} className={topItem("/dashboard")}>
                <Home size={20} strokeWidth={1.8} className="shrink-0" />
                <span className={labelCls}>Dashboard</span>
              </Link>
            </li>

            {/* While permissions load, show a skeleton instead of a wrong menu */}
            {!permissionsLoaded
              ? [0, 1, 2, 3, 4].map((i) => (
                  <li key={`sk-${i}`} className="flex h-11 items-center px-4">
                    <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                  </li>
                ))
              : rendered}
          </ul>
        </nav>

        {/* Tech support + copyright */}
        <div className="shrink-0 space-y-4 px-3 pb-4">
          <a
            href={SUPPORT_HREF}
            title={collapsed ? "Tech Support" : undefined}
            className={`flex items-center gap-3 rounded-lg border border-border-subtle bg-background p-3.5 transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600 ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <Headset size={28} strokeWidth={1.6} className="shrink-0 text-accent-500" />

            <span className={`min-w-0 ${labelCls}`}>
              <span className="block text-sm font-semibold text-text-primary">Tech Support</span>
              <span className="block text-xs text-text-secondary">We&apos;re here to help</span>
            </span>

            <ChevronRight size={16} className={`ml-auto shrink-0 text-text-disabled ${labelCls}`} />
          </a>

          <p className={`px-2 text-xs text-text-secondary ${labelCls}`}>
            © {new Date().getFullYear()} Technovatic Solutions
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
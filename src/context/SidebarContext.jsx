import {
  useState,
  useEffect,
} from "react";
import { useLocation } from "react-router-dom";

import SidebarContext from "./sidebarValue";

const COLLAPSE_KEY = "hrms.sidebarCollapsed";

/**
 * Two independent things live here:
 *
 *  - `open` / mobile drawer state (below lg) — unchanged from before.
 *  - `collapsed` — desktop-only (lg+) icon-rail mode. The sidebar shrinks
 *    from ~240px to ~72px and shows icons only. Persisted in
 *    localStorage so a refresh keeps the user's choice.
 */
export const SidebarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setOpen(false);
  }

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close drawer on Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Persist the collapsed rail preference.
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      // localStorage unavailable — ignore, preference just won't persist
    }
  }, [collapsed]);

  const value = {
    open,
    setOpen,
    toggle: () => setOpen((prev) => !prev),
    close: () => setOpen(false),
    collapsed,
    toggleCollapsed: () => setCollapsed((prev) => !prev),
    setCollapsed,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
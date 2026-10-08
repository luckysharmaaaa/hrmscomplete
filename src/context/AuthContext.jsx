import { useCallback, useEffect, useMemo, useRef, useState } from 'react';import { getUser, logout as logoutApi } from "../services/loginAPI";
import { AUTH_EXPIRED_EVENT, FORBIDDEN_EVENT, clearAuthStorage } from "../services/api";
import { getMyPermissions } from "../services/permissionApi";

import { AuthContext } from "./authValue";

const getStoredToken = () => localStorage.getItem("token") || localStorage.getItem("accessToken");

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// GET /auth/me -> { user, address, roles, profileImage }
const extractProfile = (response) => {
  const data = response?.data?.data || response?.data || response;
  if (!data || typeof data !== "object") return null;
  return data.user ? data : { user: data };
};

const isSame = (a, b) => {
  try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
};

const permissionKey = (moduleSlug, action) => `${moduleSlug}:${action}`;
const PERMISSION_REFRESH_MS = 60000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [profile, setProfileState] = useState(null);
  const [loading, setLoading] = useState(true);

  // RBAC — one source: GET /auth/me/permissions (DB -> permissions + menu).
  // Loaded ONCE after login / page load and shared by sidebar, routes and buttons.
  const [permissionKeys, setPermissionKeys] = useState(() => new Set());
  const [menu, setMenu] = useState([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  const inFlightRef = useRef(null);
  const permInFlightRef = useRef(null);

  const resetPermissions = useCallback(() => {
    setPermissionKeys(new Set());
    setMenu([]);
    setPermissionsLoaded(false);
  }, []);

  const loadPermissions = useCallback(() => {
    if (!getStoredToken()) return Promise.resolve();
    if (permInFlightRef.current) return permInFlightRef.current;

    permInFlightRef.current = getMyPermissions()
      .then((res) => {
        const data = res?.data?.data || {};
        const list = Array.isArray(data.permissions) ? data.permissions : [];
        const nextMenu = Array.isArray(data.menu) ? data.menu : [];
        setPermissionKeys((prev) => {
          const next = new Set(list);
          return prev.size === next.size && [...next].every((k) => prev.has(k)) ? prev : next;
        });
        setMenu((prev) => (isSame(prev, nextMenu) ? prev : nextMenu));
      })
      .catch((error) => {
        // Keep what we had. On first load that is an empty set (fail closed);
        // the backend enforces every action anyway.
        console.error("Failed to load permissions:", error);
      })
      .finally(() => {
        permInFlightRef.current = null;
        setPermissionsLoaded(true);
      });

    return permInFlightRef.current;
  }, []);

  const hasPermission = useCallback(
    (moduleSlug, action) => permissionKeys.has(permissionKey(moduleSlug, action)),
    [permissionKeys],
  );

  const hasAnyPermission = useCallback(
    (moduleSlug, actions = ["view"]) => actions.some((a) => permissionKeys.has(permissionKey(moduleSlug, a))),
    [permissionKeys],
  );

  const clearAuth = useCallback(() => {
    clearAuthStorage();
    setUser(null);
    setProfileState(null);
    resetPermissions();
  }, [resetPermissions]);

  const setProfile = useCallback((next) => {
    if (!next) return;
    const full = next.user ? next : { user: next };
    setProfileState((prev) => (isSame(prev, full) ? prev : full));
    setUser((prev) => (isSame(prev, full.user) ? prev : full.user));
    localStorage.setItem("user", JSON.stringify(full.user));
    // NOTE: permissions are no longer re-fetched here (that caused an extra
    // API call on every profile refresh / tab focus).
  }, []);

  const refreshUser = useCallback(() => {
    if (!getStoredToken()) {
      setUser(null);
      setProfileState(null);
      return Promise.resolve(null);
    }
    if (inFlightRef.current) return inFlightRef.current;

    inFlightRef.current = getUser()
      .then((response) => {
        const next = extractProfile(response);
        if (next) setProfile(next);
        return next;
      })
      .catch((error) => {
        if (error?.response?.status === 401) clearAuth();
        else console.error("Failed to refresh user:", error);
        return null;
      })
      .finally(() => {
        inFlightRef.current = null;
      });

    return inFlightRef.current;
  }, [clearAuth, setProfile]);

  // Initial load: profile + permissions together, so no unauthorised UI flashes.
  useEffect(() => {
    let active = true;
    const init = async () => {
      if (!getStoredToken()) {
        setUser(null);
        setLoading(false);
        return;
      }
      await Promise.all([refreshUser(), loadPermissions()]);
      if (active) setLoading(false);
    };
    init();
    return () => { active = false; };
  }, [refreshUser, loadPermissions]);

  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, resetPermissions);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, resetPermissions);
  }, [resetPermissions]);

  // 403 from the API, or the tab regaining focus -> quietly re-sync permissions (throttled),
  // so a role change made by an admin shows up without a re-login.
  useEffect(() => {
    let last = 0;
    const resync = (minGap) => () => {
      const now = Date.now();
      if (now - last < minGap || !getStoredToken()) return;
      last = now;
      loadPermissions();
    };
    const onForbidden = resync(5000);
    const onFocus = resync(PERMISSION_REFRESH_MS);
    window.addEventListener(FORBIDDEN_EVENT, onForbidden);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener(FORBIDDEN_EVENT, onForbidden);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadPermissions]);

  const login = useCallback(
    async ({ accessToken, refreshToken, user: loggedInUser, roles }) => {
      localStorage.setItem("token", accessToken);
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("roles", JSON.stringify(roles || []));
      if (loggedInUser) {
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
      }
      await Promise.all([refreshUser(), loadPermissions()]);
    },
    [refreshUser, loadPermissions],
  );

  const logout = useCallback(async () => {
    try { await logoutApi(); } catch (error) { console.error("Logout API failed:", error); } finally { clearAuth(); }
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user, profile, setUser, setProfile, loading, login, logout,
      clearUser: clearAuth, refreshUser, isAuthenticated: !!user,
      // RBAC (database driven — no role names anywhere in the UI)
      hasPermission, hasAnyPermission, permissionsLoaded, menu,
      refreshPermissions: loadPermissions,
    }),
    [user, profile, loading, login, logout, clearAuth, refreshUser, setProfile,
     hasPermission, hasAnyPermission, permissionsLoaded, menu, loadPermissions],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

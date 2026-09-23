import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getUser,
  logout as logoutApi,
} from "../services/loginAPI";

import {
  AUTH_EXPIRED_EVENT,
  clearAuthStorage,
} from "../services/api";

export const AuthContext = createContext(null);

const getStoredToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken");

const readStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Failed to parse stored user:", error);
    return null;
  }
};

// GET /auth/me returns the full profile:
//   { user, address, roles, profileImage }
// A bare user object is wrapped so callers always get the same shape.
const extractProfile = (response) => {
  const data =
    response?.data?.data ||
    response?.data ||
    response;

  if (!data || typeof data !== "object") return null;

  return data.user ? data : { user: data };
};

// Keeps object references stable when nothing changed, so a background
// refresh doesn't re-render (or reset forms) for identical data.
const isSame = (a, b) => {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  // user    = the flat user record ({ id, firstName, lastName, email, ... })
  // profile = the full payload from /auth/me (user + address + roles + photo)
  const [user, setUser] = useState(readStoredUser);
  const [profile, setProfileState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Holds the in-flight /auth/me request so that Navbar, Profile, StrictMode
  // double-effects, etc. all share ONE network call.
  const inFlightRef = useRef(null);

  const clearAuth = useCallback(() => {
    clearAuthStorage();
    setUser(null);
    setProfileState(null);
  }, []);

  // =========================================================
  // SET PROFILE  (after /auth/me, a save, or a photo change)
  // =========================================================
  const setProfile = useCallback((next) => {
    if (!next) return;

    const full = next.user ? next : { user: next };

    setProfileState((prev) => (isSame(prev, full) ? prev : full));
    setUser((prev) => (isSame(prev, full.user) ? prev : full.user));

    localStorage.setItem("user", JSON.stringify(full.user));
  }, []);

  // =========================================================
  // REFRESH USER  (GET /auth/me, de-duplicated)
  // Resolves to the full profile, or null on failure.
  // =========================================================
  const refreshUser = useCallback(() => {
    if (!getStoredToken()) {
      setUser(null);
      setProfileState(null);
      return Promise.resolve(null);
    }

    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    inFlightRef.current = getUser()
      .then((response) => {
        const next = extractProfile(response);

        if (next) {
          setProfile(next);
        }

        return next;
      })
      .catch((error) => {
        // Only an auth failure ends the session. A network blip or a 500
        // must not log the user out. (api.js already tried a token refresh
        // before a 401 reaches this point.)
        if (error?.response?.status === 401) {
          clearAuth();
        } else {
          console.error("Failed to refresh user:", error);
        }

        return null;
      })
      .finally(() => {
        inFlightRef.current = null;
      });

    return inFlightRef.current;
  }, [clearAuth, setProfile]);

  // =========================================================
  // INITIAL AUTH CHECK
  // =========================================================
  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      if (!getStoredToken()) {
        setUser(null);
        setLoading(false);
        return;
      }

      await refreshUser();

      if (active) {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      active = false;
    };
  }, [refreshUser]);

  // =========================================================
  // SESSION EXPIRED (fired by api.js when refresh fails)
  // =========================================================
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setProfileState(null);
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    };
  }, []);

  // =========================================================
  // LOGIN  (called by Login.jsx with the /auth/login payload)
  // =========================================================
  const login = useCallback(
    async ({ accessToken, refreshToken, user: loggedInUser, roles }) => {
      localStorage.setItem("token", accessToken);
      localStorage.setItem("accessToken", accessToken);

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      localStorage.setItem("roles", JSON.stringify(roles || []));

      if (loggedInUser) {
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
      }

      // Load the full profile once so Navbar/Profile can just read it.
      await refreshUser();
    },
    [refreshUser]
  );

  // =========================================================
  // LOGOUT
  // =========================================================
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  // =========================================================
  // CONTEXT VALUE
  // =========================================================
  const value = useMemo(
    () => ({
      user,
      profile,
      setUser,
      setProfile,
      loading,
      login,
      logout,
      clearUser: clearAuth, // used by ProfileSidebar
      refreshUser,
      isAuthenticated: !!user,
    }),
    [user, profile, loading, login, logout, clearAuth, refreshUser, setProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// =========================================================
// USE AUTH HOOK
// =========================================================
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
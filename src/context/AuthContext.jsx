import React, { createContext, useContext, useState, useCallback } from "react";
import { getUser as getStoredUser } from "../services/loginAPI";
import { getMyProfile } from "../services/profileApi";

const AuthContext = createContext(null);

const buildInitialProfile = () => ({
  user: getStoredUser() || null,
  roles: [],
  address: null,
  profileImage: null,
});

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(buildInitialProfile);
  const [loading, setLoading] = useState(false);

  // Re-fetches the full profile from GET /auth/me (source of truth).
  // Falls back silently to whatever is already in state on failure.
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setProfile({ user: null, roles: [], address: null, profileImage: null });
      return null;
    }

    setLoading(true);

    try {
      const response = await getMyProfile();
      const data = response?.data;

      if (data?.user) {
        setProfile(data);
        return data;
      }

      return null;
    } catch (error) {
      console.error("Failed to refresh profile:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback((partialUser) => {
    setProfile((prev) => ({
      ...prev,
      user: { ...(prev.user || {}), ...partialUser },
    }));
  }, []);

  const clearUser = useCallback(() => {
    setProfile({ user: null, roles: [], address: null, profileImage: null });
  }, []);

  const value = {
    profile,
    user: profile.user,
    roles: profile.roles,
    address: profile.address,
    profileImage: profile.profileImage,
    loading,
    refreshUser,
    updateUser,
    setProfile,
    clearUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
};
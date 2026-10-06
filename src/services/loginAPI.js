import api from "./api";

// =========================================================
// AUTH
// =========================================================

export const loginUser = (email, password) => {
  return api.post("/auth/login", {
    email,
    password,
  });
};

// Continue with Google (sign-in + self-registration).
// `credential` is the Google ID token; `mode` is "login" or "register".
// The backend verifies the token and decides everything else
// (domain, role, status) — nothing else is sent.
export const googleAuth = (credential, mode = "login") => {
  return api.post("/auth/google", {
    credential,
    mode,
  });
};

// First password for a Google-registered user (they have no login token yet,
// so the Google credential is the proof of identity; the backend re-verifies it).
export const googleSetPassword = (credential, password) => {
  return api.post("/auth/google/set-password", {
    credential,
    password,
  });
};

export const getUser = () => {
  return api.get("/auth/me");
};

export const logout = () => {
  return api.post("/auth/logout");
};

export const refreshToken = (refreshTokenValue) => {
  return api.post("/auth/refresh-token", {
    refreshToken: refreshTokenValue,
  });
};

// First-time access for employees who don't have a company email yet.
// The backend always answers with the same generic success message, whether
// or not the email is registered.
export const requestFirstTimeAccess = (email) => {
  return api.post("/auth/first-time-access", {
    email,
  });
};

// =========================================================
// PASSWORD
// =========================================================

export const forgotPassword = (email) => {
  return api.post("/auth/forgot-password", {
    email,
  });
};

export const resetPassword = (token, password) => {
  return api.post("/auth/reset-password", {
    token,
    password,
  });
};

export const changePassword = (
  currentPassword,
  newPassword
) => {
  return api.post("/auth/change-password", {
    currentPassword,
    newPassword,
  });
};

// =========================================================
// PROFILE
// =========================================================

export const updateProfile = (data) => {
  return api.put("/auth/profile", data);
};

export const uploadProfilePhoto = (formData) => {
  return api.post("/auth/profile/photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const removeProfilePhoto = () => {
  return api.delete("/auth/profile/photo");
};

export default {
  loginUser,
  googleAuth,
  googleSetPassword,
  getUser,
  logout,
  refreshToken,
  requestFirstTimeAccess,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
};
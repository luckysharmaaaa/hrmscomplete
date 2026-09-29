import api, { API_URL } from "./api";

// ============================================================
// Server Base URL
// ============================================================
// API_URL normally contains:
// http://localhost:5000/api/v1
//
// We remove /api/v1 so uploaded files such as:
// uploads/users/profile.jpg
// resolve to:
// http://localhost:5000/uploads/users/profile.jpg
//
// The fallback prevents the application from crashing if
// VITE_API_URL is temporarily unavailable.
// ============================================================

const SERVER_BASE_URL = (
  API_URL || "http://localhost:5000/api/v1"
).replace(/\/api\/v1\/?$/, "");

// ============================================================
// Get File URL
// ============================================================

export const getFileUrl = (fileURL) => {
  if (!fileURL) {
    return null;
  }

  // If backend already returns a complete URL,
  // use it directly.
  if (/^https?:\/\//i.test(String(fileURL))) {
    return String(fileURL);
  }

  // Handle relative paths safely.
  return `${SERVER_BASE_URL}/${String(fileURL).replace(/^\/+/, "")}`;
};

// ============================================================
// Get My Profile
// ============================================================
// Backend:
// GET /auth/me
// ============================================================

export const getMyProfile = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

// ============================================================
// Update My Profile
// ============================================================
// Backend:
// PUT /auth/profile
// ============================================================

export const updateMyProfile = async (payload) => {
  const response = await api.put(
    "/auth/profile",
    payload
  );

  return response.data;
};

// ============================================================
// Upload Profile Photo
// ============================================================
// Backend:
// POST /auth/profile/photo
//
// Multer field name:
// file
// ============================================================

export const uploadProfileImage = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/auth/profile/photo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ============================================================
// Remove Profile Photo
// ============================================================
// Backend:
// DELETE /auth/profile/photo
// ============================================================

export const removeProfileImage = async () => {
  const response = await api.delete(
    "/auth/profile/photo"
  );

  return response.data;
};

// ============================================================
// Change Password
// ============================================================
// Backend:
// POST /auth/change-password
// ============================================================

export const changePassword = async (payload) => {
  const response = await api.post(
    "/auth/change-password",
    payload
  );

  return response.data;
};
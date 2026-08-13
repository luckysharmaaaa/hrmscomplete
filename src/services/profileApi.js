import api, { API_URL } from "./api";

// Derive the server's root URL (without /api/v1) so relative fileURLs
// like "uploads/users/xxx.jpg" resolve to a real image URL, without
// hardcoding localhost separately from the existing API config.
const SERVER_BASE_URL = API_URL.replace(/\/api\/v1\/?$/, "");

export const getFileUrl = (fileURL) => {
  if (!fileURL) return null;
  if (/^https?:\/\//i.test(fileURL)) return fileURL;
  return `${SERVER_BASE_URL}/${fileURL.replace(/^\/+/, "")}`;
};

// ==============================
// Get My Profile
// ==============================
export const getMyProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// ==============================
// Update My Profile (+ address)
// ==============================
export const updateMyProfile = async (payload) => {
  const response = await api.put("/auth/profile", payload);
  return response.data;
};

// ==============================
// Upload Profile Photo
// ==============================
export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await api.post("/auth/profile/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// ==============================
// Remove Profile Photo
// ==============================
export const removeProfileImage = async () => {
  const response = await api.delete("/auth/profile/photo");
  return response.data;
};

// ==============================
// Change Password
// ==============================
export const changePassword = async (payload) => {
  const response = await api.put("/auth/change-password", payload);
  return response.data;
};
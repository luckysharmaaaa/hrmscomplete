import api from "./api"; // ← same axios instance used by attendanceAdminApi.js

// Backend envelope: { success, message, data }
const unwrap = (res) => res.data?.data;

export const getWfhRequests = (params) =>
  api.get("/wfh", { params }).then(unwrap); // → { items, pagination }

export const getWfhSummary = (params) =>
  api.get("/wfh/summary", { params }).then(unwrap);

export const getWfhMeta = () => api.get("/wfh/meta").then(unwrap);

export const createWfhRequest = (payload) => api.post("/wfh", payload).then(unwrap);

export const updateWfhRequest = (id, payload) =>
  api.put(`/wfh/${id}`, payload).then(unwrap);

export const reviewWfhRequest = (id, status, comment) =>
  api.patch(`/wfh/${id}/status`, { status, comment }).then(unwrap);

export const deleteWfhRequest = (id) => api.delete(`/wfh/${id}`).then(unwrap);

// ── Employee self-service ──
export const getMyWfh = () => api.get("/wfh/my").then(unwrap);
export const createMyWfh = (payload) => api.post("/wfh/my", payload).then(unwrap);
export const cancelMyWfh = (id) => api.delete(`/wfh/my/${id}`).then(unwrap);

export const apiErrorMessage = (err, fallback = "Something went wrong. Please try again.") =>
  err?.response?.data?.message || err?.message || fallback;
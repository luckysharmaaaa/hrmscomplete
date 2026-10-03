import api from "./api";

// Backend is the single source of truth: the gate answers location, method,
// state and whether this user may punch from HRMS. The UI only renders it.
export const getAttendanceGate = async () => {
  const res = await api.get("/attendance/gate");
  return res.data.data;
};

// Punch endpoints are the same URLs as before (now policy-aware on the server).
export const gatePunchIn = async (location = null) => {
  const res = await api.post("/attendance/punch-in", location ? { location } : {});
  return res.data;
};

export const gatePunchOut = async (location = null) => {
  const res = await api.post("/attendance/punch-out", location ? { location } : {});
  return res.data;
};

// ---- admin: biometric availability + policy ----
export const getBiometricStatus = async (date) => {
  const res = await api.get("/attendance/biometric-status", { params: date ? { date } : {} });
  return res.data.data;
};

export const setBiometricStatus = async ({ date, unavailable, reason }) => {
  const res = await api.put("/attendance/biometric-status", { date, unavailable, reason });
  return res.data.data;
};

export const setBiometricEnforcement = async (enforced) => {
  const res = await api.put("/attendance/settings/enforcement", { enforced });
  return res.data.data;
};

import api from "./api";

// Get today's attendance (null data = not punched in yet, not an error)
export const getTodayAttendance = async () => {
  const res = await api.get("/attendance/today");
  return res.data; // { success, message, data: { attendance, shift } | null }
};

export const punchIn = async () => {
  const res = await api.post("/attendance/punch-in", {});
  return res.data;
};

export const punchOut = async () => {
  const res = await api.post("/attendance/punch-out", {});
  return res.data;
};

export const getAttendanceHistory = async (page = 1, limit = 10) => {
  const res = await api.get("/attendance/history", { params: { page, limit } });
  return res.data;
};
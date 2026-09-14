import api from "./api";

export const getAdminAttendance = async (filters = {}) => {
  const params = {};
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.employeeId) params.employeeId = filters.employeeId;
  if (filters.departmentId) params.departmentId = filters.departmentId;
  if (filters.designationId) params.designationId = filters.designationId;
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;

  const res = await api.get("/attendance/admin", { params });
  return res.data.data;
};

export const getAdminAttendanceSummary = async (date) => {
  const res = await api.get("/attendance/admin/summary", {
    params: date ? { date } : {},
  });
  return res.data.data;
};

export const updateAdminAttendance = async (attendanceId, payload) => {
  const res = await api.patch(`/attendance/admin/${attendanceId}`, payload);
  return res.data.data;
};

export const getDepartments = async () => {
  const res = await api.get("/departments");
  const payload = res.data?.data;
  return Array.isArray(payload) ? payload : payload?.data ?? [];
};
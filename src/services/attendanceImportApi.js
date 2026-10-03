import api from "./api";

const buildForm = (file) => {
  const form = new FormData();
  form.append("file", file);
  return form;
};

// Step 1 - validate only, nothing is saved
export const previewAttendanceImport = async (file, onProgress) => {
  const res = await api.post("/attendance/import/preview", buildForm(file), {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return res.data.data;
};

// Step 2 - save raw punches + update attendance
export const importAttendance = async (file, onProgress) => {
  const res = await api.post("/attendance/import", buildForm(file), {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return res.data.data;
};

export const getImportHistory = async (page = 1, limit = 10) => {
  const res = await api.get("/attendance/import/history", { params: { page, limit } });
  return res.data.data;
};

export const getImportErrors = async (importId, page = 1, limit = 50) => {
  const res = await api.get(`/attendance/import/${importId}/errors`, { params: { page, limit } });
  return res.data.data;
};

// Report (add this one to attendanceAdminApi.js if you prefer to keep it there)
export const getAttendanceReport = async ({ startDate, endDate, departmentId } = {}) => {
  const params = { startDate, endDate };
  if (departmentId) params.departmentId = departmentId;
  const res = await api.get("/attendance/admin/report", { params });
  return res.data.data;
};

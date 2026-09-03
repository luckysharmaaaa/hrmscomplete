import api from "./api";

export const submitRegularization = async (payload) => {
  const res = await api.post("/attendance/regularization", payload);
  return res.data;
};

export const getMyRegularizations = async (page = 1, limit = 100, status) => {
  const res = await api.get("/attendance/regularization/my", {
    params: { page, limit, ...(status ? { status } : {}) },
  });
  return res.data;
};

export const getRegularizationsForReview = async (page = 1, limit = 20, status) => {
  const res = await api.get("/attendance/regularization", {
    params: { page, limit, ...(status ? { status } : {}) },
  });
  return res.data;
};

export const approveRegularization = async (id, reviewRemarks = null) => {
  const res = await api.patch(`/attendance/regularization/${id}/approve`, { reviewRemarks });
  return res.data;
};

export const rejectRegularization = async (id, reviewRemarks) => {
  const res = await api.patch(`/attendance/regularization/${id}/reject`, { reviewRemarks });
  return res.data;
};
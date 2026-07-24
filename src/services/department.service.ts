import api from "../services/api"; // Use your existing axios instance

export const getDepartments = async () => {
  return api.get("/departments");
};

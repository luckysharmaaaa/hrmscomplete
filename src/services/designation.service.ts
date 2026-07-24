import api from "../services/api";

export const getDesignations = async () => {
  return api.get("/designations");
};

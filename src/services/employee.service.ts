import api from "./api"; // use your existing axios instance

export const createEmployee = (data: any) => {
  return api.post("/employees", data);
};

export const getEmployees = () => {
  return api.get("/employees");
};

// Users who exist in the users table but are NOT yet employees
export const getImportableUsers = () => {
  return api.get("/employees/users");
};

export const checkUser = (data: any) => {
  return api.post("/employees/check-user", data);
};

export const importEmployee = (userId: number) => {
  return api.get(`/employees/import/${userId}`);
};

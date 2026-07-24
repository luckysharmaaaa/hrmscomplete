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
// for check User exists or not
export const checkUser = (data: any) => {
  return api.post("/employees/check-user", data);
};
// import Employee
export const importEmployee = (userId: number) => {
  return api.get(`/employees/import/${userId}`);
};

// Inside employee.service.ts
export const updateEmployee = (employeeId: number, data: any) => {
  return api.put(`/employees/${employeeId}`, data);
};

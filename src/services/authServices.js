import api from "./api";

// ==============================
// Login
// ==============================
export const login = async (loginData) => {
  try {
    const response = await api.post("/auth/login", loginData);

    if (response.data?.data?.accessToken) {
      localStorage.setItem("token", response.data.data.accessToken);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.data.user)
      );
    }

    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        success: false,
        message: "Something went wrong",
      }
    );
  }
};

// ==============================
// Logout
// ==============================
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ==============================
// Get Token
// ==============================
export const getToken = () => {
  return localStorage.getItem("token");
};
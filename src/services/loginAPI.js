import api from "./api";

// ==============================
// Login API
// ==============================
export const login = async (loginData) => {
  try {
    const response = await api.post("/auth/login", loginData);

    console.log("Login Response:", response.data);

    // Save token and user details
    if (response.data?.data?.accessToken) {
  localStorage.setItem(
    "token",
    response.data.data.accessToken
  );

  localStorage.setItem(
    "refreshToken",
    response.data.data.refreshToken
  );

  localStorage.setItem(
    "user",
    JSON.stringify(response.data.data.user)
  );
}

    return response.data;

  } catch (error) {
    console.error(
      "Login API Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};


// ==============================
// Logout
// ==============================
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};


// ==============================
// Get Token
// ==============================
export const getToken = () => {
  return localStorage.getItem("token");
};


// ==============================
// Get Current User
// ==============================
export const getUser = () => {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};
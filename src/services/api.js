import axios from "axios";

export const API_URL = "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Redirect to Login if Unauthorized (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove stored data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to Login page
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
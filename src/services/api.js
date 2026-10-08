import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const AUTH_EXPIRED_EVENT = "auth:expired";
export const FORBIDDEN_EVENT = "auth:forbidden";

const AUTH_STORAGE_KEYS = ["token", "accessToken", "refreshToken", "user", "roles"];

export const clearAuthStorage = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/google",
  "/auth/refresh-token",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/first-time-access",
  "/auth/change-password",
  "/auth/logout",
];

// Frontend ke public pages (yahan redirect loop nahi karna)
const PUBLIC_PAGES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/first-time-access",
];

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const expireSession = () => {
  clearAuthStorage();
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));

  // turant login page par bhejo
  const path = window.location.pathname;
  const onPublicPage =
    path === "/" || PUBLIC_PAGES.some((p) => path.startsWith(p));

  if (!onPublicPage) {
    window.location.replace("/login");
  }
};

let refreshPromise = null;

const refreshAccessToken = () => {
  if (refreshPromise) return refreshPromise;

  const storedRefreshToken = localStorage.getItem("refreshToken");
  if (!storedRefreshToken) {
    return Promise.reject(new Error("No refresh token available"));
  }

  refreshPromise = axios
    .post(`${API_URL}/auth/refresh-token`, { refreshToken: storedRefreshToken })
    .then((response) => {
      const data = response?.data?.data || response?.data;

      if (!data?.accessToken) {
        throw new Error("Refresh response did not include an access token");
      }

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("accessToken", data.accessToken);

      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      return data.accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error?.config;
    const status = error?.response?.status;
    const url = typeof original?.url === "string" ? original.url : "";

    if (status === 403) {
      window.dispatchEvent(new Event(FORBIDDEN_EVENT));
      return Promise.reject(error);
    }

    const skipRefresh =
      status !== 401 ||
      !original ||
      NO_REFRESH_PATHS.some((path) => url.includes(path));

    if (skipRefresh) {
      // logout / change-password par 401 aaye to bhi session khatam
      if (
        status === 401 &&
        original &&
        !url.includes("/auth/login") &&
        !url.includes("/auth/google") &&
        !url.includes("/auth/forgot-password") &&
        !url.includes("/auth/reset-password") &&
        !url.includes("/auth/first-time-access") &&
        !url.includes("/auth/refresh-token")
      ) {
        expireSession();
      }
      return Promise.reject(error);
    }

    if (original._retry) {
      expireSession();
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const newToken = await refreshAccessToken();
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      expireSession();
      return Promise.reject(error);
    }
  }
);

export default api;
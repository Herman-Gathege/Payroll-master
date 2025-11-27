// frontend/src/services/api.js

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token, userType, and X-User
api.interceptors.request.use(
  (config) => {
    const userType = localStorage.getItem("userType");
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user"); // <-- NEW
    const prefix = userType ? `/${userType}` : "";

    // Add Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add X-User header (backend will JSON-decode)
    if (user) {
      config.headers["X-User"] = user;
    }

    // Root endpoints — skip prefix
    const rootEndpoints = [
      "/unified_auth.php",
      "/employees.php",
      "/leave.php",
      "/leave_balance.php",
      "/payroll.php",
      "/clear_cache.php",
      "/salary_structures.php",
      "/employee_salary_structure.php",
    ];

    const shouldSkip =
      rootEndpoints.some((p) => config.url.startsWith(p)) ||
      config.url.startsWith("/employer") ||
      config.url.startsWith("/employee");

    if (!shouldSkip) {
      config.url = `${prefix}${config.url}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log("[API Interceptor] Response:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("[API Interceptor] Response error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      },
    });

    if (error.response?.status === 401) {
      const userType = localStorage.getItem("userType");

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userType");
      localStorage.removeItem("forcePasswordChange");

      if (userType === "employer") {
        window.location.href = "/employer/login";
      } else if (userType === "employee") {
        window.location.href = "/employee/login";
      } else {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

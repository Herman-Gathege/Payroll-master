// frontend/src/services/api.js

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ← Add this (helps with CORS + future cookies)
});

// Request interceptor — FINAL VERSION
api.interceptors.request.use(
  (config) => {
    const userType = localStorage.getItem("userType");
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user"); // raw JSON string

    // === 1. Authorization Header ===
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // === 2. X-User Header (CRITICAL FIX) ===
    if (userJson) {
      try {
        // Parse and re-stringify to ensure clean JSON
        const userObj = JSON.parse(userJson);
        config.headers["X-User"] = JSON.stringify(userObj);
      } catch (e) {
        console.warn("Invalid user JSON in localStorage, clearing...");
        localStorage.removeItem("user");
      }
    }

    // === 3. Dynamic URL Prefix (employee/employer) ===
    const prefix = userType ? `/${userType}` : "";

    const rootEndpoints = [
      "/unified_auth.php",
      "/employees.php",
      "/leave.php",
      "/leave_balance.php",
      "/payroll.php",
      "/clear_cache.php",
      "/salary_structures.php",
      "/employee_salary_structure.php",
      "/my_salary_structure.php", // ← ADD THIS!
      "/calculate_payroll.php",
    ];

    const shouldSkipPrefix =
      rootEndpoints.some((endpoint) => config.url?.includes(endpoint)) ||
      config.url?.startsWith("/employer") ||
      config.url?.startsWith("/employee");

    if (!shouldSkipPrefix && prefix) {
      config.url = `${prefix}${config.url}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (unchanged — perfect as-is)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API Interceptor] Response error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    if (error.response?.status === 401) {
      const userType = localStorage.getItem("userType");

      localStorage.clear(); // safer than removing one-by-one

      const redirectMap = {
        employer: "/employer/login",
        employee: "/employee/login",
      };

      window.location.href = redirectMap[userType] || "/";
    }

    return Promise.reject(error);
  }
);

export default api;
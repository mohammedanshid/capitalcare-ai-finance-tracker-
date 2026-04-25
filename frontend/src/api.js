import axios from "axios";

const API_BASE = "https://capitalcare-ai-finance-tracker.onrender.com";

const api = axios.create({
  baseURL: API_BASE,
});

// ✅ Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

import axios from "axios";

// ✅ YOUR CORRECT BACKEND
const API_BASE = "https://capitalcare-ai-finance-tracker.onrender.com";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // ✅ IMPORTANT (we use JWT, not cookies)
});

// ✅ REQUEST INTERCEPTOR (ADD TOKEN)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("🚀 API Request:", config.method?.toUpperCase(), config.url);

    return config;
  },
  (error) => {
    console.log("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// ✅ RESPONSE INTERCEPTOR (HANDLE ERRORS)
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.config.url, response.status);
    return response;
  },
  (error) => {
    console.log("❌ API Error:", error.response?.status, error.config?.url);

    // 🔥 AUTO LOGOUT IF TOKEN INVALID
    if (error.response?.status === 401) {
      console.log("⚠️ Unauthorized → logging out");

      localStorage.removeItem("token");

      // redirect safely
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// ✅ YOUR BACKEND
const API = "https://capitalcare-ai-finance-tracker.onrender.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ IMPORTANT: allow cookies
  axios.defaults.withCredentials = true;

  useEffect(() => {
    checkAuth();
  }, []);

  // ✅ GET USER FROM COOKIE
  const checkAuth = async () => {
    try {
      const { data } = await axios.get(`${API}/api/me`, {
        withCredentials: true,
      });

      setUser(data);
    } catch (err) {
      console.log("Auth check failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIN (NO TOKEN STORAGE)
  const login = async (email, password) => {
    try {
      await axios.post(
        `${API}/api/login`,
        { email, password },
        { withCredentials: true }
      );

      await checkAuth();

      return { success: true };
    } catch (error) {
      console.log("LOGIN ERROR:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Login failed",
      };
    }
  };

  // ✅ REGISTER
  const register = async (name, email, password) => {
    try {
      await axios.post(
        `${API}/api/register`,
        { name, email, password },
        { withCredentials: true }
      );

      await checkAuth();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Register failed",
      };
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

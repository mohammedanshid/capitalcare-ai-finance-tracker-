import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// ✅ YOUR BACKEND
const API = "https://capitalcare-ai-finance-tracker.onrender.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // ✅ GET USER USING TOKEN
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${API}/api/me`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ IMPORTANT
        },
      });

      setUser(data);
    } catch (err) {
      console.log("Auth check failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${API}/api/login`, {
        email,
        password,
      });

      // ✅ SAVE TOKEN
      localStorage.setItem("token", data.token);

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
      const { data } = await axios.post(`${API}/api/register`, {
        name,
        email,
        password,
      });

      // ✅ SAVE TOKEN
      localStorage.setItem("token", data.token);

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
    localStorage.removeItem("token"); // ✅ CLEAR TOKEN
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

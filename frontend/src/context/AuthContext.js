import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// ✅ BACKEND URL
const API = "https://capitalcare-ai-finance-tracker.onrender.com";

// ✅ IMPORTANT: ENABLE COOKIES FOR ALL REQUESTS
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // ✅ CHECK USER USING COOKIE
  const checkAuth = async () => {
    try {
      const { data } = await axios.get(`${API}/api/me`, {
        withCredentials: true
      });

      setUser(data);
    } catch (error) {
      console.log("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIN (COOKIE BASED)
  const login = async (email, password) => {
    try {
      await axios.post(`${API}/api/login`, {
        email,
        password,
      }, {
        withCredentials: true
      });

      await checkAuth();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Login failed",
      };
    }
  };

  // ✅ REGISTER (COOKIE BASED)
  const register = async (name, email, password) => {
    try {
      await axios.post(`${API}/api/register`, {
        name,
        email,
        password,
      }, {
        withCredentials: true
      });

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
  const logout = async () => {
    try {
      await axios.post(`${API}/api/logout`, {}, {
        withCredentials: true
      });
    } catch (e) {}

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

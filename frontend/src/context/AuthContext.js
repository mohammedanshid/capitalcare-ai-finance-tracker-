import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// ✅ YOUR BACKEND
const API = "https://capitalcare-ai-finance-tracker.onrender.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      console.log("LOGIN FUNCTION CALLED"); // 👈 DEBUG

      const res = await axios.post(`${API}/api/login`, {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data); // 👈 DEBUG

      // ✅ SAVE TOKEN
      localStorage.setItem("token", res.data.token);

      return { success: true };

    } catch (error) {
      console.log("LOGIN ERROR:", error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.detail || "Login failed",
      };
    }
  };

  // ✅ REGISTER
  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API}/api/register`, {
        name,
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

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
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

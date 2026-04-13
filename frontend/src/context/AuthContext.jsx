import { createContext, useContext, useState, useEffect } from "react";
import { registerAPI, loginAPI } from "../api/auth";
import { toastMessage } from "../utils/toastMessage";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate the user state from localStorage on mount.
  // In a real production app, we would make an API call to verify the token here.
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from local storage", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await loginAPI({ email, password });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toastMessage.success("Logged in successfully!");
      return data;
    } catch (error) {
      toastMessage.error(error.message);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await registerAPI({ name, email, password });
      toastMessage.success("Registered successfully! Please log in.");
      return data;
    } catch (error) {
      toastMessage.error(error.message);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toastMessage.info("Logged out successfully");
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// src/api/auth.js
import API from './api';

export const registerAPI = async (userData) => {
  try {
    const response = await API.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "An error occurred");
  }
};

export const loginAPI = async (userData) => {
  try {
    const response = await API.post("/auth/login", userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "An error occurred");
  }
};

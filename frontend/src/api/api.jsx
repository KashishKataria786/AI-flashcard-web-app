import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP || 'http://localhost:5000/api',
  timeout: 300000, // 5 minutes for long AI generations
});

export default API;
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  //for connecting local backend use 'http://localhost:3000/api'
});
// console.log(import.meta.env.VITE_API_URL)

// Har request mein token automatically laga do
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('Veloxa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 aaye toh logout karo
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('Veloxa_token');
      localStorage.removeItem('Veloxa_client');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
import axios from 'axios';

const api = axios.create({
  baseURL: `http://192.168.43.37:3000/api`,  //for connecting local backend use http://localhost:3000/api
});

// Har request mein token automatically laga do
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexabot_token');
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
      localStorage.removeItem('nexabot_token');
      localStorage.removeItem('nexabot_client');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/',  // You can change this to your API base URL if needed
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;

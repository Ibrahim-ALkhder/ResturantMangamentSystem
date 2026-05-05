import axios from 'axios';

// هذا السطر يحدد الرابط تلقائياً: 
// إذا كنت على Render سيستخدم رابط الـ backend المرفوع
// إذا كنت على جهازك سيستخدم localhost
const getBaseURL = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  return 'https://alshatibi-backend.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // تجنب إعادة التوجيه اللانهائي إذا كنت أصلاً في صفحة اللوجن
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

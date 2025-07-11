import axios from 'axios';

// Lấy URL cơ sở của API từ biến môi trường
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Sử dụng Axios Interceptor để "chặn" mọi request trước khi nó được gửi đi
apiClient.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage
        const token = localStorage.getItem('token');
        // Nếu có token, đính kèm nó vào header Authorization
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Xử lý lỗi nếu có
        return Promise.reject(error);
    }
);

export default apiClient;
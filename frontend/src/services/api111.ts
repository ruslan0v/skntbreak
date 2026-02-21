import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE = 'https://localhost:7059/api';

let axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Interceptor РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ С‚РѕРєРµРЅР°
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

// Interceptor РґР»СЏ РѕР±СЂР°Р±РѕС‚РєРё РѕС€РёР±РѕРє
axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('auth_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const setAuthToken = (token: string) => {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
};

export const getAuthToken = () => localStorage.getItem('token');

export const clearAuth = () => {
    delete axiosInstance.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
};

export default axiosInstance;

import axiosInstance, { setAuthToken, clearAuth } from '../api/client';
import { User, AuthResponse } from '../types/auth.types';

const AUTH_USER_STORAGE_KEY = 'auth_user';

export const authService = {
    login: async (login: string, password: string): Promise<AuthResponse> => {
        const response = await axiosInstance.post<AuthResponse>('/users/login', {
            login,
            password
        });

        if (response.data.token) {
            setAuthToken(response.data.token);
        }

        return response.data;
    },

    register: async (userName: string, login: string, password: string): Promise<void> => {
        await axiosInstance.post('/users/register', {
            userName,
            login,
            password
        });
    },

    getStoredUser: (): User | null => {
        const user = localStorage.getItem(AUTH_USER_STORAGE_KEY);
        return user ? JSON.parse(user) : null;
    },

    saveUser: (user: User): void => {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    },

    logout: (): void => {
        clearAuth();
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    }
};
import { api, setAuthToken, clearAuth } from '../api/client';
import { User, AuthResponse } from '../types/auth.types';

const AUTH_USER_STORAGE_KEY = 'auth_user';

export const authService = {
    login: async (login: string, password: string) => {
        const response = await api.Users.login(login, password); // ✅ через api
        if (response.data.token) {
            setAuthToken(response.data.token); // ✅ named import
        }
        return response.data;
    },

    register: async (userName: string, login: string, password: string) => {
        await api.Users.register(userName, login, password); // ✅
    },

    getStoredUser: (): User | null => {
        const user = localStorage.getItem(AUTH_USER_STORAGE_KEY);
        return user ? JSON.parse(user) : null;
    },

    saveUser: (user: User): void => {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    },

    logout: () => {
        clearAuth(); // ✅ named import
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    }
};
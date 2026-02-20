import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7059/api';

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const setAuthToken = (token: string) => {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
};

export const clearAuth = () => {
    delete apiClient.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('authuser');
};

// API endpoints
export const api = {
    // === SHIFTS ===
    Shifts: {
        startShift: (data: { scheduleId: number; workDate?: string }) =>
            apiClient.post('/UserShifts/start', data),  // ✅ БЕЗ дефиса!

        endShift: () =>
            apiClient.post('/UserShifts/end'),

        getMyShifts: () =>
            apiClient.get('/UserShifts/my'),

        getMyShift: (date: string) =>
            apiClient.get(`/UserShifts/my/${date}`),

        deleteShift: (id: number) =>
            apiClient.delete(`/UserShifts/${id}`),

        getColleagues: (scheduleId: number, workDate: string) =>
            apiClient.get('/UserShifts/colleagues', {
                params: { scheduleId, workDate },
            }),
    },

    // === QUEUE ===
    Queue: {
        enqueue: (durationMinutes?: number) =>
            apiClient.post('/BreakQueue/enqueue', { durationMinutes }),  // ✅ БЕЗ дефиса!

        getState: () =>
            apiClient.get('/BreakQueue/state'),

        confirm: (queueEntryId: number) =>
            apiClient.post(`/BreakQueue/confirm/${queueEntryId}`),

        postpone: (queueEntryId: number) =>
            apiClient.post(`/BreakQueue/postpone/${queueEntryId}`),

        skipRound: () =>
            apiClient.post('/BreakQueue/skip-round'),

        priorityBreak: (targetUserId: number, durationMinutes?: number) =>
            apiClient.post(`/BreakQueue/priority/${targetUserId}`, { durationMinutes }),
    },

    // === SCHEDULES ===
    Schedules: {
        getAllSchedules: () =>
            apiClient.get('/Schedule/getall'),  // ✅ БЕЗ 's'

        getSchedule: (id: number) =>
            apiClient.get(`/Schedule/${id}`),

        createSchedule: (data: {
            name: string;
            startTime: string;
            endTime: string;
            shiftType?: number;
        }) =>
            apiClient.post('/Schedule/create', data),

        updateSchedule: (id: number, data: {
            name?: string;
            startTime?: string;
            endTime?: string;
            shiftType?: number;
        }) =>
            apiClient.put(`/Schedule/update/${id}`, data),

        deleteSchedule: (id: number) =>
            apiClient.post(`/Schedule/${id}`),
    },

    // === USERS ===
    Users: {
        login: (login: string, password: string) =>
            apiClient.post('/Users/login', { login, password }),

        register: (userName: string, login: string, password: string) =>
            apiClient.post('/Users/register', { userName, login, password }),

        getProfile: () =>
            apiClient.get('/Users/profile'),

        updateProfile: (data: { userName?: string }) =>
            apiClient.put('/Users/profile', data),
    },

    // === BREAKS ===
    Breaks: {
        startBreak: (data: { breakNumber: number; durationMinutes: number }) =>
            apiClient.post('/Breaks/start', data),

        endBreak: (breakId: number) =>
            apiClient.post(`/Breaks/end/${breakId}`),

        skipBreak: (data: { breakNumber: number; durationMinutes: number }) =>
            apiClient.post('/Breaks/skip', data),

        getMyActiveBreak: () =>
            apiClient.get('/Breaks/my-active'),

        getActiveBreaksInShift: (date: string) =>
            apiClient.get(`/Breaks/active-in-shift?date=${date}`),

        getMyHistory: (date: string) =>
            apiClient.get(`/Breaks/my-history?date=${date}`),

        getBreakPoolInfo: (date: string) =>
            apiClient.get(`/Breaks/pool-info?date=${date}`),
    },

    // === ADMIN ===
    Admin: {
        getDashboardStats: () =>
            apiClient.get('/Admin/stats'),

        getTodayShifts: () =>
            apiClient.get('/Admin/shifts/today'),

        getAllUsers: () =>
            apiClient.get('/Admin/users'),

        getUserById: (id: number) =>
            apiClient.get(`/Admin/users/${id}`),

        createUser: (data: {
            userName: string;
            login: string;
            password: string;
            role: string;
        }) =>
            apiClient.post('/Admin/users', data),

        updateUser: (id: number, data: {
            userName?: string;
            login?: string;
            password?: string;
            role?: string;
        }) =>
            apiClient.put(`/Admin/users/${id}`, data),

        deleteUser: (id: number) =>
            apiClient.delete(`/Admin/users/${id}`),

        getAllBreakPools: () =>
            apiClient.get('/Admin/break-pools'),

        createBreakPool: (data: {
            workDate: string;
            group: number;
            maxCurrentBreaks: number;
        }) =>
            apiClient.post('/Admin/break-pools', data),

        getAllSchedulesAdmin: () =>
            apiClient.get('/Admin/schedules'),

        createScheduleAdmin: (data: {
            name: string;
            startTime: string;
            endTime: string;
            shiftType: number;
        }) =>
            apiClient.post('/Admin/schedules', data),

        deleteScheduleAdmin: (id: number) =>
            apiClient.delete(`/Admin/schedules/${id}`),

        endUserShift: (userShiftId: number) =>
            apiClient.post(`/Admin/shifts/${userShiftId}/end`),
    },
};


export default apiClient;

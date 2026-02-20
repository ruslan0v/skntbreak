import apiClient from '../api/client';  
import {
    AdminUserDto,
    CreateUserAdminDto,
    UpdateUserAdminDto,
    DashboardStatsDto,
    UserShiftDetailDto,
    BreakPoolDayDto,
    CreateBreakPoolDayDto,
    Schedule,
    CreateScheduleDto,
    UpdateScheduleDto,
} from '../types/admin';

export const adminService = {
    // Статистика
    getDashboardStats: async (): Promise<DashboardStatsDto> => {
        const response = await apiClient.get('/admin/stats');
        return response.data;
    },

    getTodayShifts: async (): Promise<UserShiftDetailDto[]> => {
        const response = await apiClient.get('/admin/shifts/today');
        return response.data;
    },

    // Пользователи
    getAllUsers: async (): Promise<AdminUserDto[]> => {
        const response = await apiClient.get('/admin/users');
        return response.data;
    },

    getUserById: async (id: number): Promise<AdminUserDto> => {
        const response = await apiClient.get(`/admin/users/${id}`);
        return response.data;
    },

    createUser: async (data: CreateUserAdminDto): Promise<AdminUserDto> => {
        const response = await apiClient.post('/admin/users', data);
        return response.data;
    },

    updateUser: async (id: number, data: UpdateUserAdminDto): Promise<AdminUserDto> => {
        const response = await apiClient.put(`/admin/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (userId: number): Promise<void> => {
        await apiClient.delete(`/admin/users/${userId}`);
    },

    // Расписания
    getAllSchedules: async (): Promise<Schedule[]> => {
        const response = await apiClient.get('/admin/schedules');
        return response.data;
    },

    getScheduleById: async (id: number): Promise<Schedule> => {
        const response = await apiClient.get(`/admin/schedules/${id}`);
        return response.data;
    },

    createSchedule: async (data: CreateScheduleDto): Promise<Schedule> => {
        const response = await apiClient.post('/admin/schedules', data);
        return response.data;
    },

    updateSchedule: async (id: number, data: UpdateScheduleDto): Promise<Schedule> => {
        const response = await apiClient.put(`/admin/schedules/${id}`, data);
        return response.data;
    },

    deleteSchedule: async (id: number): Promise<void> => {
        await apiClient.delete(`/admin/schedules/${id}`);
    },

    // Пулы перерывов
    getAllBreakPools: async (): Promise<BreakPoolDayDto[]> => {
        const response = await apiClient.get('/admin/break-pools');
        return response.data;
    },

    createOrUpdateBreakPool: async (data: CreateBreakPoolDayDto): Promise<BreakPoolDayDto> => {
        const response = await apiClient.post('/admin/break-pools', data);
        return response.data;
    },
};

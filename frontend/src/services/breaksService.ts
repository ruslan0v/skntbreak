import axiosInstance from './api';
import { Break, StartBreakRequest, SkipBreakRequest } from '../types/break.types';

export const breaksService = {
    startBreak: async (breakNumber: number, durationMinutes: number): Promise<Break> => {
        const response = await axiosInstance.post<Break>('/breaks/create', {
            breakNumber,
            durationMinutes
        } as StartBreakRequest);
        return response.data;
    },

    endBreak: async (breakId: number): Promise<Break> => {
        const response = await axiosInstance.post<Break>(`/breaks/end/${breakId}`);
        return response.data;
    },

    skipBreak: async (breakNumber: number): Promise<Break> => {
        const response = await axiosInstance.post<Break>('/breaks/skip', {
            breakNumber
        } as SkipBreakRequest);
        return response.data;
    },

    getBreakStatusText: (status: number): string => {
        const statuses: Record<number, string> = {
            0: 'Доступен',
            1: 'В процессе',
            2: 'Завершен',
            3: 'Пропущен'
        };
        return statuses[status] || 'Неизвестно';
    },

    getBreakStatusClass: (status: number): string => {
        const classes: Record<number, string> = {
            0: 'badge-info',
            1: 'badge-warning',
            2: 'badge-success',
            3: 'badge-danger'
        };
        return classes[status] || 'badge-info';
    }
};

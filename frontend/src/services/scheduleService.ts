import axiosInstance from './api';
import { Schedule } from '../types/dashboard.types';

export const scheduleService = {
    getAllSchedules: async (): Promise<Schedule[]> => {
        const response = await axiosInstance.get<Schedule[]>('/schedule/getall');
        return response.data;
    },

    getSchedule: async (id: number): Promise<Schedule> => {
        const response = await axiosInstance.get<Schedule>(`/schedule/${id}`);
        return response.data;
    },

    createSchedule: async (
        name: string,
        startTime: string,
        endTime: string
    ): Promise<Schedule> => {
        const response = await axiosInstance.post<Schedule>('/schedule/create', {
            name,
            startTime,
            endTime
        });
        return response.data;
    },

    updateSchedule: async (id: number, data: Partial<Schedule>): Promise<Schedule> => {
        const response = await axiosInstance.put<Schedule>(`/schedule/update/${id}`, data);
        return response.data;
    },

    deleteSchedule: async (id: number): Promise<void> => {
        await axiosInstance.post(`/schedule/${id}`);
    }
};

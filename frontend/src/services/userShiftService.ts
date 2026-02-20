import axiosInstance from './api';
import { UserShift } from '../types/dashboard.types';

export const userShiftService = {
    startShift: async (
        scheduleId: number,
    ): Promise<UserShift> => {
        const response = await axiosInstance.post<UserShift>('/usershifts/start', {
            scheduleId,
        });
        return response.data;
    },

    getMyShift: async (workDate: string): Promise<UserShift> => {
        const response = await axiosInstance.get<UserShift>(`/usershifts/my/${workDate}`);
        return response.data;
    },

    getMyShifts: async (): Promise<UserShift[]> => {
        const response = await axiosInstance.get<UserShift[]>('/usershifts/my');
        return response.data;
    },

    deleteShift: async (userShiftId: number): Promise<void> => {
        await axiosInstance.delete(`/usershifts/${userShiftId}`);
    },

    getShiftsByDateAndGroup: async (
        workDate: string,
        group: 'Day' | 'Evening'
    ): Promise<UserShift[]> => {
        const response = await axiosInstance.get<UserShift[]>(
            `/usershifts/by-date-group/${workDate}/${group}`
        );
        return response.data;
    },
};

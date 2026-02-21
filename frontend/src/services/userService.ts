import axiosInstance from '../api/client';

export interface UserProfile {
    id: number;
    userName: string;
    login: string;
    role: string;
    totalShifts: number;
    totalBreaks: number;
    completedBreaks: number;
    skippedBreaks: number;
}

export interface UpdateProfileRequest {
    userName?: string;
}

export const userService = {
    getProfile: async (): Promise<UserProfile> => {
        const response = await axiosInstance.get('/users/profile');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
        const response = await axiosInstance.put('/users/profile', data);
        return response.data;
    },
};

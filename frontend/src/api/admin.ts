import client from "./client";
import type {
    DashboardStatsDto,
    UserShiftDetailDto,
    AdminUserDto,
    CreateUserAdminDto,
    UpdateUserAdminDto,
    Schedule,
    CreateScheduleDto,
    UpdateScheduleDto,
    BreakPoolDayDto,
    CreateBreakPoolDayDto,
} from "../types";

export const adminApi = {
    getStats: () =>
        client.get<DashboardStatsDto>("/admin/stats").then((r) => r.data),

    getTodayShifts: () =>
        client.get<UserShiftDetailDto[]>("/admin/shifts/today").then((r) => r.data),

    getUsers: () =>
        client.get<AdminUserDto[]>("/admin/users").then((r) => r.data),

    getUser: (id: number) =>
        client.get<AdminUserDto>(`/admin/users/${id}`).then((r) => r.data),

    createUser: (data: CreateUserAdminDto) =>
        client.post<AdminUserDto>("/admin/users", data).then((r) => r.data),

    updateUser: (id: number, data: UpdateUserAdminDto) =>
        client.put<AdminUserDto>(`/admin/users/${id}`, data).then((r) => r.data),

    deleteUser: (id: number) =>
        client.delete(`/admin/users/${id}`).then((r) => r.data),

    getSchedules: () =>
        client.get<Schedule[]>("/admin/schedules").then((r) => r.data),

    createSchedule: (data: CreateScheduleDto) =>
        client.post<Schedule>("/admin/schedules", data).then((r) => r.data),

    updateSchedule: (id: number, data: UpdateScheduleDto) =>
        client.put<Schedule>(`/admin/schedules/${id}`, data).then((r) => r.data),

    deleteSchedule: (id: number) =>
        client.delete(`/admin/schedules/${id}`).then((r) => r.data),

    getBreakPools: () =>
        client.get<BreakPoolDayDto[]>("/admin/break-pools").then((r) => r.data),

    createOrUpdateBreakPool: (data: CreateBreakPoolDayDto) =>
        client.post<BreakPoolDayDto>("/admin/break-pools", data).then((r) => r.data),

    endUserShift: (userShiftId: number) =>
        client.post(`/admin/shifts/${userShiftId}/end`).then((r) => r.data),
};

export interface AdminUserDto {
    id: number;
    userName: string;
    login: string;
    role: string;
    totalShifts: number;
    totalBreaks: number;
    completedBreaks: number;
    skippedBreaks: number;
}

export interface DashboardStatsDto {
    totalUsers: number;
    totalShiftsToday: number;
    activeBreaks: number;
    completedBreaksToday: number;
    skippedBreaksToday: number;
    totalBreaksToday: number;
}

export interface UserShiftDetailDto {
    id: number;
    userId: number;
    userName: string;
    scheduleName: string;
    workDate: string;
    group: string;
    totalBreaks: number;
    activeBreaks: number;
    completedBreaks: number;
    skippedBreaks: number;
}

export interface CreateUserAdminDto {
    userName: string;
    login: string;
    password: string;
    role: string;
}

export interface UpdateUserAdminDto {
    userName?: string;
    login?: string;
    password?: string;
    role?: string;
}

// Пулы перерывов - используем СУЩЕСТВУЮЩИЙ DTO
export interface BreakPoolDayDto {
    id: number;
    group: number;
    workDate: string;
    maxCurrentBreaks: number;
    currentBreaksCount: number;
    availableBreaksCount: number;
}

export interface CreateBreakPoolDayDto {
    group: number;
    workDate: string;
    maxCurrentBreaks: number;
}

// Расписания
export interface Schedule {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
}

export interface CreateScheduleDto {
    name: string;
    startTime: string;
    endTime: string;
}

export interface UpdateScheduleDto {
    name?: string;
    startTime?: string;
    endTime?: string;
}

// ═══ ENUMS ═══
export enum BreakStatus {
    Available = "Available",
    Taken = "Taken",
    Finished = "Finished",
    Skipped = "Skipped",
}

export enum ShiftType {
    Day = "Day",
    Evening = "Evening",
}

export enum RoleType {
    SL1 = "SL1",
    SL2 = "SL2",
    Chatter = "Chatter",
    TeamLead = "TeamLead",
    Admin = "Admin",
}

export enum QueueStatus {
    Waiting = "Waiting",
    Notified = "Notified",
    Confirmed = "Confirmed",
    Postponed = "Postponed",
    Expired = "Expired",
    Cancelled = "Cancelled",
}

// ═══ AUTH ═══
export interface LoginRequest {
    login: string;
    password: string;
}
export interface AuthResponse {
    token: string;
}

// ═══ USER ═══
export interface UserProfileDto {
    id: number;
    userName: string;
    login: string;
    role: string;
    totalShifts: number;
    totalBreaks: number;
    completedBreaks: number;
    skippedBreaks: number;
}
export interface UpdateProfileDto {
    userName?: string;
}

// ═══ SCHEDULE ═══
export interface Schedule {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    shiftType: ShiftType;
}
export interface CreateScheduleDto {
    name: string;
    startTime: string;
    endTime: string;
    shiftType: ShiftType;
}
export interface UpdateScheduleDto {
    name?: string;
    startTime?: string;
    endTime?: string;
    shiftType?: ShiftType;
}

// ═══ USER SHIFT ═══
export interface UserShiftDto {
    id: number;
    userId: number;
    scheduleId: number;
    workDate: string;
    group: ShiftType;
    startedAt?: string;
    endedAt?: string;
    schedule?: {
        id: number;
        name: string;
        startTime: string;
        endTime: string;
    };
    breaks?: ShiftBreakDto[];
}
export interface ShiftBreakDto {
    id: number;
    status: BreakStatus;
    durationMinutes: number;
    breakNumber: number;
    startTime: string;
    endTime?: string;
}
export interface StartShiftRequest {
    scheduleId: number;
}
export interface ColleagueDto {
    userId: number;
    userName: string;
    group: string;
    isCurrentUser: boolean;
    activeBreaksCount: number;
    completedBreaksCount: number;
}

// ═══ BREAK ═══
export interface ActiveBreakDto {
    id: number;
    userId: number;
    userShiftId: number;
    status: BreakStatus;
    durationMinutes: number;
    breakNumber: number;
    startTime: string;
    workDate: string;
    userName: string;
}
export interface BreakDetailsDto {
    id: number;
    userId: number;
    userShiftId: number;
    status: BreakStatus;
    durationMinutes: number;
    startTime: string;
    endTime?: string;
    workDate: string;
    breakNumber: number;
}
export interface BreakPoolInfoDto {
    totalBreaks: number;
    availableBreaks: number;
    activeBreaks: number;
    canTakeBreak: boolean;
    message?: string;
}

// ═══ QUEUE ═══
export interface QueueEntryDto {
    id: number;
    userId: number;
    userName: string;
    position: number;
    durationMinutes: number;
    status: QueueStatus;
    isPriority: boolean;
    enqueuedAt: string;
    notifiedAt?: string;
}
export interface QueueStateDto {
    currentRound: number;
    isRoundComplete: boolean;
    queue: QueueEntryDto[];
    availableSlots: number;
    activeBreaks: number;
    allowDurationChoice: boolean;
    remaining10Min?: number;
    remaining20Min?: number;
    myEntry?: QueueEntryDto;
}
export interface QueuePositionDto {
    queueEntryId: number;
    position: number;
    breakRound: number;
    durationMinutes: number;
    status: QueueStatus;
    peopleAhead: number;
    message?: string;
}
export interface EnqueueRequestDto {
    durationMinutes?: number;
}

// ═══ ADMIN ═══
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
export interface BreakPoolDayDto {
    id: number;
    group: ShiftType;
    workDate: string;
    maxCurrentBreaks: number;
    currentBreaksCount: number;
    availableBreaksCount: number;
}
export interface CreateBreakPoolDayDto {
    group: ShiftType;
    workDate: string;
    maxCurrentBreaks: number;
}

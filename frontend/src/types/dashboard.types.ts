import { Break } from './break.types';

export type ShiftType = 'Day' | 'Evening';

export interface UserShift {
    id: number;
    userId: number;
    scheduleId: number;
    workDate: string;
    group: ShiftType;
    schedule?: Schedule;
    breaks?: Break[];
}

export interface Schedule {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    shiftType: ShiftType;
}

export interface DashboardStats {
    totalBreaks: number;
    completedBreaks: number;
    remainingBreaks: number;
    currentBreakDuration: number;
}

export interface StartShiftRequest {
    scheduleId: number;
}

export interface BreakPoolDay {
    id: number;
    group: ShiftType;
    workDate: string;
    totalBreaks: number;
    availableBreaks: number;
}

export type ShiftType = 'Day' | 'Evening';

export interface Schedule {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
}

interface UserShift {
    id: number;
    userId: number;
    scheduleId: number;
    workDate: string;
    group: 'Day' | 'Evening';  // Добавить тип смены
    startedAt?: string;
    endedAt?: string;
    schedule?: Schedule;
    breaks?: Break[];
}


export interface User {
    id: number;
    userName: string;
    login: string;
    role: string;
}

export interface Break {
    id: number;
    userShiftId: number;
    status: string;
    durationMinutes: number;
    breakNumber: number;
    startTime: string;
    endTime?: string;
    workDate: string;
}

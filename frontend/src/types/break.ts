export interface Break {
    id: number;
    userShiftId: number;
    status: 'Available' | 'Taken' | 'Finished' | 'Skipped';
    durationMinutes: number;
    breakNumber: number;
    startTime?: string;
    endTime?: string;
    workDate: string;
}

export interface ActiveBreak {
    id: number;
    userId: number;
    userShiftId: number;
    status: 'Taken';
    durationMinutes: number;
    breakNumber: number;
    startTime: string;
    workDate: string;
}

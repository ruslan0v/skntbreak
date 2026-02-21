import client from "./client";
import type { Schedule, UserShiftDto, StartShiftRequest, ColleagueDto } from "../types";

export const shiftsApi = {
    getAvailable: () =>
        client.get<Schedule[]>("/usershifts/available").then((r) => r.data),

    startShift: (data: StartShiftRequest) =>
        client.post<UserShiftDto>("/usershifts/start", data).then((r) => r.data),

    getMyShift: (date: string) =>
        client.get<UserShiftDto>(`/usershifts/my/${date}`).then((r) => r.data),

    getMyShifts: () =>
        client.get<UserShiftDto[]>("/usershifts/my").then((r) => r.data),

    endShift: () =>
        client.post("/usershifts/end").then((r) => r.data),

    getColleagues: (scheduleId: number, workDate: string) =>
        client
            .get<ColleagueDto[]>("/usershifts/colleagues", {
                params: { scheduleId, workDate },
            })
            .then((r) => r.data),
};

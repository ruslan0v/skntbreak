import client from "./client";
import type { ActiveBreakDto, BreakDetailsDto, BreakPoolInfoDto } from "../types";

export const breaksApi = {
    getMyActive: () =>
        client
            .get<{ hasActiveBreak: boolean; breakData?: ActiveBreakDto }>("/breaks/my-active")
            .then((r) => r.data),

    endBreak: (breakId: number) =>
        client.post<BreakDetailsDto>(`/breaks/end/${breakId}`).then((r) => r.data),

    getActiveInShift: (date: string) =>
        client
            .get<ActiveBreakDto[]>("/breaks/active-in-shift", { params: { date } })
            .then((r) => r.data),

    getMyHistory: (date: string) =>
        client
            .get<BreakDetailsDto[]>("/breaks/my-history", { params: { date } })
            .then((r) => r.data),

    getPoolInfo: (date: string) =>
        client
            .get<BreakPoolInfoDto>("/breaks/pool-info", { params: { date } })
            .then((r) => r.data),
};

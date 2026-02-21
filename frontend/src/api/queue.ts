import client from "./client";
import type { QueueStateDto, QueuePositionDto, ActiveBreakDto, EnqueueRequestDto } from "../types";

export const queueApi = {
    getState: () =>
        client.get<QueueStateDto>("/breakqueue/state").then((r) => r.data),

    enqueue: (data?: EnqueueRequestDto) =>
        client.post<QueuePositionDto>("/breakqueue/enqueue", data ?? {}).then((r) => r.data),

    confirm: (queueEntryId: number) =>
        client.post<ActiveBreakDto>(`/breakqueue/confirm/${queueEntryId}`).then((r) => r.data),

    postpone: (queueEntryId: number) =>
        client.post<QueuePositionDto>(`/breakqueue/postpone/${queueEntryId}`).then((r) => r.data),

    skipRound: () =>
        client.post("/breakqueue/skip-round").then((r) => r.data),

    priorityBreak: (targetUserId: number, data?: EnqueueRequestDto) =>
        client
            .post<QueuePositionDto>(`/breakqueue/priority/${targetUserId}`, data ?? {})
            .then((r) => r.data),
};

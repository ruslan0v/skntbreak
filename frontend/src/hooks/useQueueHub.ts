import { useEffect, useRef, useCallback } from "react";
import {
    HubConnectionBuilder,
    HubConnection,
    LogLevel,
} from "@microsoft/signalr";
import type { QueueEntryDto } from "../types";

interface QueueHubEvents {
    onYourTurn?: (
        queueEntryId: number,
        durationMinutes: number,
        timeoutSeconds: number
    ) => void;
    onNotificationExpired?: (queueEntryId: number, newPosition: number) => void;
    onQueueUpdated?: (
        queue: QueueEntryDto[],
        availableSlots: number,
        currentRound: number
    ) => void;
    onBreakEnded?: (userId: number, userName: string, breakRound: number) => void;
}

export function useQueueHub(events: QueueHubEvents) {
    const connRef = useRef<HubConnection | null>(null);
    const eventsRef = useRef(events);
    eventsRef.current = events;

    const connect = useCallback(async () => {
        if (connRef.current) return;
        const token = localStorage.getItem("token");
        if (!token) return;

        const hubBase = import.meta.env.VITE_API_URL ?? "https://localhost:7059";

        const conn = new HubConnectionBuilder()
            .withUrl(`${hubBase}/breakQueueHub`, {
                accessTokenFactory: () => token,
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Warning)
            .build();

        conn.on(
            "YourTurn",
            (queueEntryId: number, durationMinutes: number, timeoutSeconds: number) => {
                eventsRef.current.onYourTurn?.(queueEntryId, durationMinutes, timeoutSeconds);
            }
        );

        conn.on(
            "NotificationExpired",
            (queueEntryId: number, newPosition: number) => {
                eventsRef.current.onNotificationExpired?.(queueEntryId, newPosition);
            }
        );

        conn.on(
            "QueueUpdated",
            (queue: QueueEntryDto[], availableSlots: number, currentRound: number) => {
                eventsRef.current.onQueueUpdated?.(queue, availableSlots, currentRound);
            }
        );

        conn.on(
            "BreakEnded",
            (userId: number, userName: string, breakRound: number) => {
                eventsRef.current.onBreakEnded?.(userId, userName, breakRound);
            }
        );

        try {
            await conn.start();
            connRef.current = conn;
        } catch (err) {
            console.error("[SignalR] Connection failed:", err);
        }
    }, []);

    useEffect(() => {
        connect();
        return () => {
            connRef.current?.stop();
            connRef.current = null;
        };
    }, [connect]);
}

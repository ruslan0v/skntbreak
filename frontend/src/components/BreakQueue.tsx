import React, { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../api/client";
import { startConnection } from "../services/signalRService";
import toast from "react-hot-toast";

interface QueueEntry {
    id: number;
    userId: number;
    userName: string;
    position: number;
    durationMinutes: number;
    status:
    | "Waiting"
    | "Notified"
    | "Confirmed"
    | "Postponed"
    | "Expired"
    | "Cancelled";
    isPriority: boolean;
    enqueuedAt: string;
    notifiedAt: string | null;
}

interface QueueState {
    currentRound: number;
    isRoundComplete: boolean;
    queue: QueueEntry[]; // ✅ массив
    availableSlots: number;
    activeBreaks: number;
    allowDurationChoice: boolean;
    remaining10Min: number | null;
    remaining20Min: number | null;
    myEntry: QueueEntry | null;
}

interface BreakQueueProps {
    activeBreak: any;
    onBreakStateChange: () => void;
}

export const BreakQueue: React.FC<BreakQueueProps> = ({
    activeBreak,
    onBreakStateChange,
}) => {
    const [state, setState] = useState<QueueState | null>(null); // ✅
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notificationCountdown, setNotificationCountdown] = useState<number>(0);
    const countdownRef = useRef<ReturnType<typeof setInterval>>();

    const loadState = useCallback(async () => {
        try {
            const response = await api.Queue.getState();
            setState(response.data);
        } catch (err) {
            console.error("Ошибка загрузки состояния очереди:", err);
        } finally {
            setLoading(false);
        }
    }, []); // ✅

    useEffect(() => {
        let mounted = true;

        const setupSignalR = async () => {
            try {
                const conn = await startConnection();

                conn.on(
                    "QueueUpdated",
                    (
                        queue: QueueEntry[],
                        availableSlots: number,
                        currentRound: number,
                    ) => {
                        if (!mounted) return;
                        setState((prev) =>
                            prev ? { ...prev, queue, availableSlots, currentRound } : prev,
                        );
                    },
                );

                conn.on(
                    "YourTurn",
                    (
                        queueEntryId: number,
                        durationMinutes: number,
                        timeoutSeconds: number,
                    ) => {
                        if (!mounted) return;
                        setNotificationCountdown(timeoutSeconds);
                        loadState();
                    },
                );

                conn.on(
                    "NotificationExpired",
                    (queueEntryId: number, newPosition: number) => {
                        if (!mounted) return;
                        setNotificationCountdown(0);
                        loadState();
                    },
                );

                conn.on("BreakEnded", () => {
                    if (!mounted) return;
                    loadState();
                });
            } catch (err) {
                console.error("Ошибка настройки SignalR в очереди:", err);
            }
        };

        setupSignalR();
        loadState();

        return () => {
            mounted = false;
        };
    }, [loadState]); // ✅

    useEffect(() => {
        if (notificationCountdown > 0) {
            countdownRef.current = setInterval(() => {
                setNotificationCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownRef.current);
                        loadState();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(countdownRef.current);
        }
    }, [notificationCountdown, loadState]); // ✅

    const handleEnqueue = async () => {
        setActionLoading(true);
        try {
            await api.Queue.enqueue();
            toast.success("Вы успешно встали в очередь");
            await loadState();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Ошибка постановки в очередь"); // ✅
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!state?.myEntry) return;
        setActionLoading(true);
        try {
            await api.Queue.confirm(state.myEntry.id);
            setNotificationCountdown(0);
            await loadState();
            onBreakStateChange();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Ошибка подтверждения"); // ✅
        } finally {
            setActionLoading(false);
        }
    };

    const handlePostpone = async () => {
        if (!state?.myEntry) return;
        setActionLoading(true);
        try {
            await api.Queue.postpone(state.myEntry.id);
            setNotificationCountdown(0);
            await loadState();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Ошибка"); // ✅
        } finally {
            setActionLoading(false);
        }
    };

    if (loading || !state) return null;

    const isInQueue =
        state.myEntry &&
        (state.myEntry.status === "Waiting" || state.myEntry.status === "Notified"); // ✅
    const isNotified = state.myEntry?.status === "Notified";
    const visibleQueue = state.queue.filter(
        (q) => q.status === "Waiting" || q.status === "Notified", // ✅
    );

    return (
        <div className= "panel-main mt-4" >
        <div
        style={
        {
            display: "flex",
                justifyContent: "space-between",
                    alignItems: "center",
                        marginBottom: "24px",
        }
    }
      >
        <h3 style={ { margin: 0, fontSize: "20px", fontWeight: 700 } }>
            { " "}
          Очередь на перерыв{ " " }
    </h3>
        < span className = "text-muted fw-medium" >
            { " "}
          Свободно мест: { state.availableSlots } { " " }
    </span>
        </div>

    {
        isNotified && (
            <div className="queue-alert-box mb-4" >
                <div className="queue-alert-info" >
                    <span className="queue-alert-icon" >🔔</span>
                        < div >
                        <div
                className="fw-bold"
        style = {{ fontSize: "18px", color: "#111827" }
    }
              >
        Ваша очередь!
            </div>
            < div
    className = "text-red fw-bold tabular-nums"
    style = {{ marginTop: "4px" }
}
              >
    Подтвердите в течение { notificationCountdown } сек.
              </div>
        </div>
        </div>
        < div className = "queue-alert-actions" >
            <button
              className="btn-solid-green"
onClick = { handleConfirm }
disabled = { actionLoading }
    >
    Иду на перерыв
        </button>
        < button
className = "btn-outline-secondary"
onClick = { handlePostpone }
disabled = { actionLoading }
    >
    Позже
    </button>
    </div>
    </div>
      )}

<table className="borderless-table" >
    <thead>
    <tr>
    <th style={ { width: "80px" } }> Позиция </th>
        < th > Имя </th>
        < th > Длительность </th>
        </tr>
        </thead>
        <tbody>
{
    visibleQueue.map((entry) => {
        const isMe = entry.id === state.myEntry?.id;
        return (
            <tr key= { entry.id } >
            <td className="text-muted tabular-nums fw-bold" >
                  #{ entry.position } { " " }
        </td>
            < td >
            <div className="user-name-cell" >
                {!isMe && <span className="user-icon" >👤</span>
    }
                    <span
                      className={ isMe? "fw-bold": "fw-medium" }
                      style = {{ color: "#111827" }}
                    >
    { isMe? `(Вы) ${entry.userName}` : entry.userName}
{
    entry.isPriority && (
        <span
                          title="Приоритет"
    style = {{ marginLeft: "8px", fontSize: "14px" }
}
                        >
                          ⭐
</span>
                      )}
</span>
    </div>
    </td>
    < td className = "text-muted fw-medium tabular-nums" >
        { " "}
{ entry.durationMinutes } мин{ " " }
</td>
    </tr>
            );
          })}
{
    visibleQueue.length === 0 && (
        <tr>
        <td
                colSpan={ 3 }
    style = {{
        padding: "24px 0",
            textAlign: "center",
                color: "#9CA3AF",
                }
}
              >
    Очередь пуста
        </td>
        </tr>
          )}
</tbody>
    </table>

{
    !isInQueue && !activeBreak && (
        <div style={ { marginTop: "32px" } }>
            <button
            className="btn-outline-green"
    onClick = { handleEnqueue }
    disabled = { actionLoading }
        >
        { actionLoading? "Загрузка...": "Встать в очередь" }
        </button>
        </div>
      )
}

{
    isInQueue && !isNotified && (
        <div
          className="text-green fw-medium mt-4"
    style = {{
        textAlign: "center",
            backgroundColor: "#F0FDF4",
                padding: "16px",
                    borderRadius: "16px",
          }
}
        >
    Вы находитесь в очереди.Ваша позиция: #{ state.myEntry?.position }
</div>
      )}
</div>
  );
};

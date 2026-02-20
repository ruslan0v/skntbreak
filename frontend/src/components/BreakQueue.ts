import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../apiclient';
import { startConnection, getConnection } from '../services/signalRService';
import toast from 'react-hot-toast';

interface QueueEntry {
    id: number;
    userId: number;
    userName: string;
    position: number;
    durationMinutes: number;
    status: number; // 0=Waiting, 1=Notified, 2=Confirmed, 3=Postponed, 4=Expired, 5=Cancelled
    isPriority: boolean;
    enqueuedAt: string;
    notifiedAt: string | null;
}

interface QueueState {
    currentRound: number;
    isRoundComplete: boolean;
    queue: QueueEntry[];
    availableSlots: number;
    activeBreaks: number;
    allowDurationChoice: boolean;
    remaining10Min: number | null;
    remaining20Min: number | null;
    myEntry: QueueEntry | null;
}

const STATUS_LABELS: Record<number, string> = {
    0: 'Ожидание',
    1: 'Уведомлен',
    2: 'Подтвержден',
    3: 'Отложен',
    4: 'Истек',
    5: 'Отменён',
};

const STATUS_COLORS: Record<number, string> = {
    0: '#6b7280',
    1: '#f59e0b',
    2: '#10b981',
    3: '#8b5cf6',
    4: '#ef4444',
    5: '#9ca3af',
};

export const BreakQueue: React.FC = () => {
    const [state, setState] = useState<QueueState | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState<number>(20);
    const [notificationCountdown, setNotificationCountdown] = useState<number>(0);
    const countdownRef = useRef<ReturnType<typeof setInterval>>();

    const loadState = useCallback(async () => {
        try {
            const response = await api.Queue.getState();
            setState(response.data);
        } catch (err) {
            console.error('Error loading queue state:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // SignalR
    useEffect(() => {
        let mounted = true;

        const setup = async () => {
            const conn = await startConnection();

            conn.on('QueueUpdated', (queue: QueueEntry[], availableSlots: number, currentRound: number) => {
                if (!mounted) return;
                setState((prev) => (prev ? { ...prev, queue, availableSlots, currentRound } : prev));
            });

            conn.on('YourTurn', (queueEntryId: number, durationMinutes: number, timeoutSeconds: number) => {
                if (!mounted) return;
                toast('🔔 Ваша очередь на перерыв!', { icon: '⏰', duration: 10000 });
                setNotificationCountdown(timeoutSeconds);
                loadState();
            });

            conn.on('NotificationExpired', (queueEntryId: number, newPosition: number) => {
                if (!mounted) return;
                toast.error(`Время истекло. Новая позиция: ${newPosition}`);
                setNotificationCountdown(0);
                loadState();
            });

            conn.on('BreakEnded', (userId: number, userName: string, breakRound: number) => {
                if (!mounted) return;
                toast(`${userName} завершил перерыв`, { icon: '✅' });
                loadState();
            });
        };

        setup();
        loadState();

        return () => {
            mounted = false;
            const conn = getConnection();
            if (conn) {
                conn.off('QueueUpdated');
                conn.off('YourTurn');
                conn.off('NotificationExpired');
                conn.off('BreakEnded');
            }
        };
    }, [loadState]);

    // Countdown таймер
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
    }, [notificationCountdown, loadState]);

    const handleEnqueue = async () => {
        setActionLoading(true);
        try {
            const duration = state?.allowDurationChoice ? selectedDuration : undefined;
            await api.Queue.enqueue(duration);
            toast.success('Вы встали в очередь!');
            await loadState();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка');
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!state?.myEntry) return;
        setActionLoading(true);
        try {
            await api.Queue.confirm(state.myEntry.id);
            toast.success('Перерыв подтвержден!');
            setNotificationCountdown(0);
            await loadState();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePostpone = async () => {
        if (!state?.myEntry) return;
        setActionLoading(true);
        try {
            await api.Queue.postpone(state.myEntry.id);
            toast('Перерыв отложен', { icon: '⏰' });
            setNotificationCountdown(0);
            await loadState();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSkipRound = async () => {
        if (!window.confirm('Вы уверены, что хотите пропустить этот перерыв?')) return;
        setActionLoading(true);
        try {
            await api.Queue.skipRound();
            toast('Перерыв пропущен', { icon: '⏭️' });
            await loadState();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div style= { styles.card } >
            <p>Загрузка очереди...</p>
                </div>
    );
  }

if (!state) {
    return (
        <div style= { styles.card } >
        <p>Нет данных </p>
            </div>
    );
}

const isInQueue = state.myEntry && (state.myEntry.status === 0 || state.myEntry.status === 1);
const isNotified = state.myEntry?.status === 1;

return (
    <div style= { styles.container } >
    {/* Шапка */ }
    < div style = { styles.header } >
        <h3 style={ styles.title }> Очередь на перерыв #{ state.currentRound } </h3>
            < div style = { styles.badges } >
                <span style={ styles.badge }> Свободно: { state.availableSlots } </span>
                    < span
style = {{
              ...styles.badge,
        backgroundColor: '#dbeafe',
            color: '#2563eb',
            }}
          >
    На перерыве: { state.activeBreaks }
</span>
    </div>
    </div>

{/* Уведомление — ваша очередь */ }
{
    isNotified && (
        <div style={ styles.notification }>
            <div style={ styles.notifHeader }>
                <span style={ { fontSize: '1.5rem' } }>🔔</span>
                    < strong > Ваша очередь! </strong>
    {
        notificationCountdown > 0 && (
            <span style={ styles.countdown }> { notificationCountdown } сек </span>
            )
    }
    </div>
        < p style = {{ margin: '0.5rem 0', color: '#374151' }
}>
    Перерыв { state.myEntry!.durationMinutes } мин
        </p>
        < div style = { styles.notifButtons } >
            <button onClick={ handleConfirm } disabled = { actionLoading } style = { styles.confirmBtn } >
                Иду на перерыв
                    </button>
                    < button onClick = { handlePostpone } disabled = { actionLoading } style = { styles.postponeBtn } >
                        Пока не могу
                            </button>
                            </div>
                            </div>
      )}

{/* Выбор длительности */ }
{
    state.allowDurationChoice && !isInQueue && (
        <div style={ styles.durationChoice }>
            <p style={ { margin: '0 0 0.5rem', fontWeight: 500 } }> Выберите длительность: </p>
                < div style = {{ display: 'flex', gap: '0.75rem' }
}>
    <button
              onClick={ () => setSelectedDuration(10) }
style = {{
                ...styles.durationBtn,
                ...(selectedDuration === 10 ? styles.durationBtnActive : {}),
              }}
            >
    10 мин
{
    state.remaining10Min !== null && (
        <span style={ styles.remaining }> (осталось: { state.remaining10Min })</span>
              )
}
</button>
    < button
onClick = {() => setSelectedDuration(20)}
style = {{
                ...styles.durationBtn,
                ...(selectedDuration === 20 ? styles.durationBtnActive : {}),
              }}
            >
    20 мин
{
    state.remaining20Min !== null && (
        <span style={ styles.remaining }> (осталось: { state.remaining20Min })</span>
              )
}
</button>
    </div>
    </div>
      )}

{/* Кнопки действий */ }
<div style={ styles.actions }>
    {!isInQueue ? (
        <button onClick= { handleEnqueue } disabled = { actionLoading } style = { styles.enqueueBtn } >
            { actionLoading? 'Загрузка...': 'Встать в очередь' }
            </button>
        ) : !isNotified ? (
    <div style= { styles.inQueueInfo } >
    <span>
              📋 Вы в очереди.Позиция: <strong>{ state.myEntry!.position } </strong>
    </span>
    </div>
        ) : null}
<button onClick={ handleSkipRound } disabled = { actionLoading } style = { styles.skipBtn } >
    Пропустить перерыв
        </button>
        </div>

{/* Список очереди */ }
<div style={ styles.queueList }>
    <h4 style={ { margin: '0 0 0.75rem', color: '#374151' } }> Очередь </h4>
{
    state.queue.length === 0 ? (
        <p style= {{ color: '#9ca3af', textAlign: 'center', padding: '1rem' }
}> Очередь пуста </p>
        ) : (
    state.queue
        .filter((q) => q.status === 0 || q.status === 1)
        .map((entry) => (
            <div
                key= { entry.id }
                style = {{
            ...styles.queueItem,
            borderLeft: `4px solid ${STATUS_COLORS[entry.status]}`,
            backgroundColor: entry.isPriority ? '#fef3c7' : '#fff',
        }}
              >
            <div style={ styles.queueItemLeft } >
        <span style={ styles.position } >#{ entry.position } </span>
        < div >
        <div style={{ fontWeight: 500 }}>
        { entry.userName }
                      { entry.isPriority && <span style={ styles.priorityBadge } >⭐ Приоритет </span>}
            </div>
            < div style = {{ fontSize: '0.75rem', color: '#9ca3af' }}>
        { entry.durationMinutes } мин
        </div>
        </div>
        </div>
        < span
                  style = {{
            ...styles.statusBadge,
            backgroundColor: STATUS_COLORS[entry.status] + '20',
            color: STATUS_COLORS[entry.status],
        }}
                >
            { STATUS_LABELS[entry.status]}
            </span>
            </div>
        ))
        )}
</div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    title: {
        margin: 0,
        fontSize: '1.125rem',
        fontWeight: 600,
    },
    badges: {
        display: 'flex',
        gap: '0.5rem',
    },
    badge: {
        padding: '4px 10px',
        borderRadius: '8px',
        fontSize: '0.8rem',
        fontWeight: 500,
        backgroundColor: '#dcfce7',
        color: '#16a34a',
    },
    card: {
        padding: '2rem',
        textAlign: 'center' as const,
    },
    notification: {
        backgroundColor: '#fef3c7',
        border: '2px solid #f59e0b',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1rem',
    },
    notifHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.25rem',
    },
    countdown: {
        marginLeft: 'auto',
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#dc2626',
        fontVariantNumeric: 'tabular-nums' as const,
    },
    notifButtons: {
        display: 'flex',
        gap: '0.75rem',
        marginTop: '0.75rem',
    },
    confirmBtn: {
        flex: 1,
        padding: '0.75rem',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    postponeBtn: {
        flex: 1,
        padding: '0.75rem',
        backgroundColor: '#f3f4f6',
        color: '#374151',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    durationChoice: {
        backgroundColor: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
    },
    durationBtn: {
        flex: 1,
        padding: '0.75rem',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: '0.9rem',
        transition: 'all 0.2s',
    },
    durationBtnActive: {
        borderColor: '#84cc16',
        backgroundColor: '#f7fee7',
        color: '#4d7c0f',
    },
    remaining: {
        display: 'block',
        fontSize: '0.75rem',
        color: '#6b7280',
        marginTop: '2px',
    },
    actions: {
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1rem',
        alignItems: 'center',
    },
    enqueueBtn: {
        flex: 1,
        padding: '0.75rem 1.5rem',
        backgroundColor: '#84cc16',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    skipBtn: {
        padding: '0.75rem 1rem',
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 500,
        cursor: 'pointer',
        fontSize: '0.85rem',
    },
    inQueueInfo: {
        flex: 1,
        padding: '0.75rem 1rem',
        backgroundColor: '#f0fdf4',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#16a34a',
    },
    queueList: {
        marginTop: '0.5rem',
    },
    queueItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        marginBottom: '0.5rem',
        border: '1px solid #f3f4f6',
    },
    queueItemLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    position: {
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#9ca3af',
        minWidth: '32px',
    },
    priorityBadge: {
        marginLeft: '6px',
        fontSize: '0.7rem',
        color: '#f59e0b',
    },
    statusBadge: {
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 500,
    },
};

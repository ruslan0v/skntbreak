import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import toast from 'react-hot-toast';
import { startConnection, stopConnection, getConnection } from '../services/signalRService';
import type { HubConnection } from '@microsoft/signalr';

// ============ ИНТЕРФЕЙСЫ ============
interface Schedule {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
}

interface Break {
    id: number;
    status: string;
    durationMinutes: number;
    breakNumber: number;
    startTime?: string;
    endTime?: string;
}

interface UserShift {
    id: number;
    userId: number;
    scheduleId: number;
    workDate: string;
    group: string;
    schedule?: Schedule;
    breaks?: Break[];
}

interface Colleague {
    userId: number;
    userName: string;
    group: string;
    isCurrentUser: boolean;
    activeBreaksCount: number;
    completedBreaksCount: number;
}

interface PoolInfo {
    totalBreaks: number;
    availableBreaks: number;
    activeBreaks: number;
    canTakeBreak: boolean;
    message?: string;
}

interface ActiveBreak {
    id: number;
    status: string;
    durationMinutes: number;
    breakNumber: number;
    startTime: string;
}

interface QueueEntry {
    id: number;
    userId: number;
    userName: string;
    position: number;
    durationMinutes: number;
    status: 'Waiting' | 'Notified' | 'Confirmed' | 'Cancelled';
    isPriority: boolean;
    enqueuedAt: string;
    notifiedAt?: string;
}

interface QueueState {
    currentRound: number;
    isRoundComplete: boolean;
    queue: QueueEntry[];
    availableSlots: number;
    activeBreaks: number;
    allowDurationChoice: boolean;
    remaining10Min?: number;
    remaining20Min?: number;
    myEntry?: QueueEntry;
}

// ============ КОМПОНЕНТ ============
export const DashboardPage: React.FC = () => {
    // === STATE ===
    const [currentShift, setCurrentShift] = useState<UserShift | null>(null);
    const [colleagues, setColleagues] = useState<Colleague[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeBreak, setActiveBreak] = useState<ActiveBreak | null>(null);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
    const [isEndingBreak, setIsEndingBreak] = useState(false);
    const [autoEndTriggered, setAutoEndTriggered] = useState(false);
    const [queueState, setQueueState] = useState<QueueState | null>(null);
    const [isInQueue, setIsInQueue] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    const [signalRConnection, setSignalRConnection] = useState<HubConnection | null>(null);

    // === ЭФФЕКТЫ ===

    // Таймер текущего времени
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Загрузка начальных данных
    useEffect(() => {
        loadData();
    }, []);

    // SignalR подключение при наличии смены
    useEffect(() => {
        if (!currentShift) {
            // Если смены нет, отключаем SignalR
            if (signalRConnection) {
                console.log('📴 Отключение SignalR (нет активной смены)');
                stopConnection();
                setSignalRConnection(null);
            }
            return;
        }

        let mounted = true;

        const initSignalR = async () => {
            try {
                console.log('🔌 Инициализация SignalR...');

                // Переподключаем, если уже было подключение
                await stopConnection();

                const connection = await startConnection();

                if (!mounted) return;

                // Подписка на события очереди
                connection.on('QueueUpdated', (queue: QueueEntry[], availableSlots: number, currentRound: number) => {
                    if (!mounted) return;
                    console.log('🔄 QueueUpdated:', { queue, availableSlots, currentRound });
                    setQueueState(prev => prev ? { ...prev, queue, availableSlots, currentRound } : null);
                });

                connection.on('YourTurn', (queueEntryId: number, durationMinutes: number, timeoutSeconds: number) => {
                    if (!mounted) return;
                    console.log('⏰ YourTurn:', { queueEntryId, durationMinutes, timeoutSeconds });
                    toast('🔔 Ваша очередь на перерыв!', { icon: '⏰', duration: 10000 });
                    loadQueueState();
                });

                connection.on('NotificationExpired', (queueEntryId: number, newPosition: number) => {
                    if (!mounted) return;
                    console.log('❌ NotificationExpired:', { queueEntryId, newPosition });
                    toast.error(`Время истекло. Новая позиция: ${newPosition}`);
                    loadQueueState();
                });

                connection.on('BreakEnded', (userId: number, userName: string, breakRound: number) => {
                    if (!mounted) return;
                    console.log('✅ BreakEnded:', { userId, userName, breakRound });
                    toast(`${userName} завершил перерыв`, { icon: '✅' });
                    loadQueueState();
                });

                setSignalRConnection(connection);
                console.log('✅ SignalR подключен');

                // КРИТИЧНО: Загрузить состояние очереди после подключения
                await loadQueueState();

            } catch (err) {
                console.error('❌ Ошибка SignalR:', err);
                toast.error('Ошибка подключения к серверу уведомлений');
            }
        };

        initSignalR();

        return () => {
            mounted = false;
            if (signalRConnection) {
                signalRConnection.off('QueueUpdated');
                signalRConnection.off('YourTurn');
                signalRConnection.off('NotificationExpired');
                signalRConnection.off('BreakEnded');
            }
        };
    }, [currentShift?.id]); // Перезапуск при смене ID смены

    // Таймер активного перерыва с автозавершением
    useEffect(() => {
        if (!activeBreak) {
            setRemainingSeconds(0);
            setAutoEndTriggered(false);
            return;
        }

        const calculateRemaining = () => {
            const startTime = new Date(activeBreak.startTime).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            const totalSeconds = activeBreak.durationMinutes * 60;
            const remaining = Math.max(0, totalSeconds - elapsed);

            setRemainingSeconds(remaining);

            // Автозавершение при истечении времени
            if (remaining === 0 && elapsed >= totalSeconds && !isEndingBreak && !autoEndTriggered) {
                console.log('⏱️ Время перерыва истекло, автозавершение...');
                setAutoEndTriggered(true);
                handleEndBreak();
            }
        };

        calculateRemaining();
        const interval = setInterval(calculateRemaining, 1000);
        return () => clearInterval(interval);
    }, [activeBreak, isEndingBreak, autoEndTriggered]);

    // === ФУНКЦИИ ЗАГРУЗКИ ДАННЫХ ===

    const loadData = async () => {
        // 1. Формируем дату с учетом смещения (чтобы получить локальную дату 'YYYY-MM-DD')
        const now = new Date();
        // getTimezoneOffset возвращает разницу в минутах со знаком минус для восточного полушария
        // Например, для Москвы (-180). Поэтому вычитаем смещение.
        const offset = now.getTimezoneOffset();
        const todayStr = new Date(now.getTime() - (offset * 60000)).toISOString().split('T')[0];

        try {
            setLoading(true);
            setError('');

            // 2. Параллельная загрузка независимых данных (графики и смена)
            // Это ускорит загрузку страницы
            const [schedulesResponse, shiftResponseResult] = await Promise.allSettled([
                api.Schedules.getAllSchedules(),
                api.Shifts.getMyShift(todayStr)
            ]);

            // Обработка графиков
            if (schedulesResponse.status === 'fulfilled') {
                setSchedules(schedulesResponse.value.data);
                if (schedulesResponse.value.data.length > 0 && !selectedScheduleId) {
                    // Устанавливаем дефолтный график только если он еще не выбран
                    setSelectedScheduleId(schedulesResponse.value.data[0].id.toString());
                }
            } else {
                console.error('Ошибка загрузки расписаний:', schedulesResponse.reason);
            }

            // Обработка смены
            if (shiftResponseResult.status === 'fulfilled') {
                const shiftData = shiftResponseResult.value.data;
                setCurrentShift(shiftData);

                // Если смена есть — догружаем зависимые данные (коллеги, пул, активный перерыв)
                if (shiftData?.scheduleId) {
                    try {
                        // Используем todayStr, так как API ожидает строку даты
                        const colleaguesResponse = await api.Shifts.getColleagues(
                            shiftData.scheduleId,
                            todayStr
                        );
                        setColleagues(colleaguesResponse.data);
                    } catch (err) {
                        console.error('Ошибка загрузки коллег:', err);
                    }

                    // Загружаем инфо о пуле и активном перерыве
                    // (убедитесь, что эти функции принимают строку даты или исправьте вызов)
                    await loadPoolInfo(todayStr);
                    await loadActiveBreak();
                }
            } else {
                // Если ошибка НЕ 404, логируем её
                // (Promise.allSettled не выбрасывает ошибку, нужно проверить reason)
                const error = shiftResponseResult.reason;
                if (error?.response?.status !== 404) {
                    console.error('Ошибка загрузки смены:', error);
                    // Можно показать ошибку пользователю, если это критично
                }
                // Смены нет (или ошибка) — сбрасываем стейт
                setCurrentShift(null);
                setColleagues([]); // Очищаем коллег, так как смены нет
            }

        } catch (err: any) {
            // Глобальный перехватчик непредвиденных ошибок
            setError(err.response?.data?.error || 'Критическая ошибка загрузки данных');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const loadQueueState = async () => {
        try {
            const response = await api.Queue.getState();
            console.log('📊 Состояние очереди загружено:', response.data);
            setQueueState(response.data);
            setIsInQueue(!!response.data.myEntry);
        } catch (err: any) {
            if (err.response?.status !== 404) {
                console.error('Ошибка загрузки очереди:', err);
            }
        }
    };

    const loadPoolInfo = async (date: string) => {
        try {
            const response = await api.Breaks.getBreakPoolInfo(date);
            setPoolInfo(response.data);
        } catch (err) {
            console.error('Ошибка загрузки информации о пуле:', err);
        }
    };

    const loadActiveBreak = async () => {
        try {
            const response = await api.Breaks.getMyActiveBreak();
            if (response.data.hasActiveBreak) {
                setActiveBreak(response.data.breakData);
            } else {
                setActiveBreak(null);
            }
        } catch (err) {
            console.error('Ошибка загрузки активного перерыва:', err);
        }
    };

    // === ОБРАБОТЧИКИ СОБЫТИЙ ===

    const handleStartShift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedScheduleId) {
            toast.error('Выберите расписание');
            return;
        }

        try {
            await api.Shifts.startShift({ scheduleId: parseInt(selectedScheduleId) });
            toast.success('Смена начата!');
            setShowForm(false);

            // Перезагрузка данных
            await loadData();

            // КРИТИЧНО: SignalR переподключится автоматически через useEffect[currentShift]
            // Ждем немного, чтобы подключение успело установиться
            setTimeout(async () => {
                await loadQueueState();
            }, 500);

        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка начала смены');
        }
    };

    const handleEndShift = async () => {
        if (!window.confirm('Вы уверены, что хотите завершить смену?')) return;

        try {
            await api.Shifts.endShift();
            toast.success('Смена завершена');
            setCurrentShift(null);
            setQueueState(null);
            setActiveBreak(null);
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка завершения смены');
        }
    };

    const handleDeleteShift = async () => {
        if (!currentShift || !window.confirm('Удалить смену?')) return;

        try {
            await api.Shifts.deleteShift(currentShift.id);
            toast.success('Смена удалена');
            setCurrentShift(null);
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка удаления смены');
        }
    };

    const handleStartBreak = async () => {
        if (!window.confirm('Начать перерыв?')) return;

        try {
            await api.Breaks.startBreak({ breakNumber: 1, durationMinutes: 20 });
            toast.success('Перерыв начат!');
            await loadActiveBreak();
            await loadPoolInfo(new Date().toISOString().split('T')[0]);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка начала перерыва');
        }
    };

    const handleEndBreak = async () => {
        if (!activeBreak || isEndingBreak) return;

        try {
            setIsEndingBreak(true);
            await api.Breaks.endBreak(activeBreak.id);
            toast.success('Перерыв завершен!');
            setActiveBreak(null);
            await loadPoolInfo(new Date().toISOString().split('T')[0]);
            await loadQueueState();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка завершения перерыва');
        } finally {
            setIsEndingBreak(false);
        }
    };

    const handleEnqueueBreak = async () => {
        if (!currentShift) {
            toast.error('Сначала начните смену');
            return;
        }

        try {
            const response = await api.Queue.enqueue();
            toast.success(`Вы в очереди! Позиция: ${response.data.position}`);
            await loadQueueState();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка входа в очередь');
        }
    };

    const handleConfirmBreak = async (queueEntryId: number) => {
        try {
            await api.Queue.confirm(queueEntryId);
            toast.success('Перерыв подтвержден!');
            await loadActiveBreak();
            await loadQueueState();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка подтверждения');
        }
    };

    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const getDayOfWeek = (): string => {
        const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        return days[currentTime.getDay()];
    };

    const getBreaksRemaining = (): number => {
        if (!currentShift?.breaks) return 0;
        const completed = currentShift.breaks.filter(b => b.status === 'Finished').length;
        return Math.max(0, 2 - completed); // Предполагаем 2 перерыва за смену
    };

    // === РЕНДЕР ===

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Загрузка...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            {/* Заголовок */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827', margin: 0, marginBottom: '0.5rem' }}>
                    {getDayOfWeek()}
                </h1>
                <div style={{ fontSize: '2.5rem', fontWeight: 300, color: '#84cc16' }}>
                    {formatTime(currentTime)}
                </div>
            </div>

            {/* Ошибки */}
            {error && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {/* Информация о текущей смене */}
            {currentShift && (
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Расписание:</span>
                            <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                                {' '}{currentShift.schedule?.name}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {currentShift.schedule?.startTime} - {currentShift.schedule?.endTime}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={handleDeleteShift}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}
                        >
                            Удалить
                        </button>
                        <button
                            onClick={handleEndShift}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}
                        >
                            Завершить смену
                        </button>
                    </div>
                </div>
            )}

            {/* Форма начала смены */}
            {showForm && !currentShift && (
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{ marginTop: 0 }}>Начать смену</h3>
                    <form onSubmit={handleStartShift}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Расписание
                            </label>
                            <select
                                value={selectedScheduleId}
                                onChange={(e) => setSelectedScheduleId(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="">Выберите расписание</option>
                                {schedules.map(schedule => (
                                    <option key={schedule.id} value={schedule.id}>
                                        {schedule.name} ({schedule.startTime}-{schedule.endTime})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#84cc16',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                Начать
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Кнопка начала смены */}
            {!currentShift && !showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: '#84cc16',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginBottom: '1.5rem'
                    }}
                >
                    + Начать смену
                </button>
            )}

            {/* Основная сетка */}
            {currentShift && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '2rem'
                }}>
                    {/* Левая колонка - Коллеги */}
                    <div>
                        {colleagues.length > 0 && (
                            <div style={{
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                marginBottom: '1.5rem'
                            }}>
                                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: 600 }}>
                                    Коллеги на смене
                                </h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #f3f4f6', textAlign: 'left' }}>
                                            <th style={{ padding: '12px 8px', fontWeight: 600, fontSize: '0.875rem', color: '#6b7280' }}>
                                                Сотрудник
                                            </th>
                                            <th style={{ padding: '12px 8px', fontWeight: 600, fontSize: '0.875rem', color: '#6b7280' }}>
                                                Группа
                                            </th>
                                            <th style={{ padding: '12px 8px', fontWeight: 600, fontSize: '0.875rem', color: '#6b7280' }}>
                                                Перерывы
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {colleagues.map(colleague => (
                                            <tr key={colleague.userId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{
                                                    padding: '16px 8px',
                                                    fontWeight: colleague.isCurrentUser ? 600 : 400,
                                                    color: colleague.isCurrentUser ? '#84cc16' : '#111827'
                                                }}>
                                                    {colleague.userName} {colleague.isCurrentUser && '(Вы)'}
                                                </td>
                                                <td style={{ padding: '16px 8px', color: '#6b7280' }}>
                                                    {colleague.group === 'Day' ? 'День' : 'Вечер'}
                                                </td>
                                                <td style={{ padding: '16px 8px', color: '#6b7280' }}>
                                                    {colleague.activeBreaksCount > 0 ? '🔴 ' : ''}
                                                    {colleague.completedBreaksCount} завершено
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Правая колонка - Перерыв и очередь */}
                    <div>
                        {/* Панель перерыва */}
                        <div style={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                                    {activeBreak ? 'Активный перерыв' : 'Перерыв'}
                                </h3>
                            </div>

                            <div style={{
                                fontSize: '3rem',
                                fontWeight: 300,
                                textAlign: 'center',
                                marginBottom: '2rem',
                                fontVariantNumeric: 'tabular-nums',
                                color: activeBreak ? (remainingSeconds > 0 ? '#10b981' : '#ef4444') : '#6b7280'
                            }}>
                                {activeBreak
                                    ? `${Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}`
                                    : '00:00'
                                }
                            </div>

                            {activeBreak ? (
                                <button
                                    onClick={handleEndBreak}
                                    disabled={isEndingBreak}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        backgroundColor: isEndingBreak ? '#9ca3af' : '#ef4444',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: isEndingBreak ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isEndingBreak ? 'Завершение...' : 'Завершить перерыв'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleStartBreak}
                                    disabled={!poolInfo?.canTakeBreak || loading}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        backgroundColor: poolInfo?.canTakeBreak && !loading ? '#10b981' : '#9ca3af',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: poolInfo?.canTakeBreak && !loading ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Начать перерыв
                                </button>
                            )}

                            <div style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem' }}>
                                Осталось перерывов: <strong>{getBreaksRemaining()}</strong>
                            </div>
                        </div>

                        {/* Панель очереди */}
                        {queueState && (
                            <div style={{
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 600 }}>
                                    Очередь (раунд {queueState.currentRound})
                                </h3>

                                <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                    <strong>{queueState.availableSlots}</strong> свободных мест •{' '}
                                    <strong>{queueState.activeBreaks}</strong> активных перерывов
                                </div>

                                {/* Моя запись в очереди */}
                                {queueState.myEntry && (
                                    <div style={{
                                        padding: '1rem',
                                        backgroundColor: queueState.myEntry.status === 'Notified' ? '#fef3c7' : '#f3f4f6',
                                        borderRadius: '8px',
                                        marginBottom: '1rem',
                                        border: queueState.myEntry.status === 'Notified' ? '2px solid #f59e0b' : 'none'
                                    }}>
                                        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                                            {queueState.myEntry.status === 'Notified' ? '🔔 Ваша очередь!' : `Позиция: ${queueState.myEntry.position}`}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                            Перерыв: {queueState.myEntry.durationMinutes} мин • Впереди: {queueState.myEntry.position - 1}
                                        </div>

                                        {queueState.myEntry.status === 'Notified' && (
                                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleConfirmBreak(queueState.myEntry!.id)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.5rem 1rem',
                                                        backgroundColor: '#10b981',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Подтвердить
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Кнопка входа в очередь */}
                                {!isInQueue && !activeBreak && (
                                    <button
                                        onClick={handleEnqueueBreak}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            backgroundColor: '#84cc16',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            marginBottom: '1rem'
                                        }}
                                    >
                                        Встать в очередь
                                    </button>
                                )}

                                {/* Список очереди */}
                                {queueState.queue.length > 0 && (
                                    <div>
                                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '1rem 0 0.5rem 0' }}>
                                            Очередь ({queueState.queue.length})
                                        </h4>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {queueState.queue.map(entry => (
                                                <div key={entry.id} style={{
                                                    padding: '0.5rem',
                                                    borderBottom: '1px solid #f3f4f6',
                                                    fontSize: '0.875rem',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    backgroundColor: entry.status === 'Notified' ? '#fef3c7' : 'transparent'
                                                }}>
                                                    <span>
                                                        {entry.position}. {entry.userName} {entry.isPriority && '⭐'}
                                                    </span>
                                                    <span style={{ color: '#6b7280' }}>
                                                        {entry.durationMinutes} мин • {entry.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

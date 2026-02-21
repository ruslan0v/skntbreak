import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import toast from 'react-hot-toast';
import { BreakQueue } from '../components/BreakQueue';

interface Schedule {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
}

interface Colleague {
    userId: number;
    userName: string;
    group: string;
    isCurrentUser: boolean;
    activeBreaksCount: number;
    completedBreaksCount: number;
}

export const DashboardPage: React.FC = () => {
    const [currentShift, setCurrentShift] = useState<any | null>(null);       // ✅
    const [colleagues, setColleagues] = useState<Colleague[]>([]);             // ✅
    const [schedules, setSchedules] = useState<Schedule[]>([]);                // ✅
    const [activeBreak, setActiveBreak] = useState<any | null>(null);         // ✅
    const [poolInfo, setPoolInfo] = useState<any | null>(null);
    const [selectedScheduleId, setSelectedScheduleId] = useState('');         // ✅
    const [shiftElapsed, setShiftElapsed] = useState(0);                      // ✅
    const [breakRemaining, setBreakRemaining] = useState(0);                  // ✅

    const getMskDateString = () => {
        const now = new Date();
        const msk = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (3 * 3600000));
        return msk.toISOString().split('T')[0]; // ✅ строка, не массив
    };

    const loadData = async () => {
        const todayStr = getMskDateString();
        try {
            const schedRes = await api.Shifts.getAvailableSchedules();
            setSchedules(schedRes.data);
            if (schedRes.data.length > 0 && !selectedScheduleId) {
                setSelectedScheduleId(schedRes.data[0].id.toString()); // ✅
            }

            const shiftRes = await api.Shifts.getMyShift(todayStr);
            setCurrentShift(shiftRes.data);

            if (shiftRes.data?.scheduleId) {
                const colRes = await api.Shifts.getColleagues(shiftRes.data.scheduleId, todayStr);
                setColleagues(colRes.data);

                const poolRes = await api.Breaks.getBreakPoolInfo(todayStr);
                setPoolInfo(poolRes.data);

                const breakRes = await api.Breaks.getMyActiveBreak();
                setActiveBreak(breakRes.data.hasActiveBreak ? breakRes.data.breakData : null);
            }
        } catch (err: any) {
            if (err.response?.status !== 404) {
                console.error(err);
            }
        }
    };

    useEffect(() => {
        loadData();
    }, []); // ✅

    useEffect(() => {
        if (!currentShift) return;
        const start = new Date(currentShift.startedAt).getTime();
        const interval = setInterval(() => {
            setShiftElapsed(Math.floor((Date.now() - start) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [currentShift]); // ✅ зависимость от currentShift

    useEffect(() => {
        if (!activeBreak) {
            setBreakRemaining(0);
            return;
        }
        const interval = setInterval(() => {
            const startTime = new Date(activeBreak.startTime).getTime();
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const total = activeBreak.durationMinutes * 60;
            setBreakRemaining(Math.max(0, total - elapsed));
        }, 1000);
        return () => clearInterval(interval);
    }, [activeBreak]); // ✅ зависимость от activeBreak

    const handleStartShift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedScheduleId) return;
        try {
            await api.Shifts.startShift({ scheduleId: parseInt(selectedScheduleId) });
            toast.success('Смена начата!');
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка начала смены'); // ✅
        }
    };

    const handleEndBreak = async () => {
        if (!activeBreak) return;
        try {
            await api.Breaks.endBreak(activeBreak.id);
            toast.success('Перерыв завершён!');
            setActiveBreak(null);
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка завершения перерыва'); // ✅
        }
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!currentShift) {
        return (
            <div className="panel-main" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{ marginTop: 0, fontSize: '24px' }}>Начать смену</h2>
                <form onSubmit={handleStartShift}>
                    <select
                        className="clean-input mt-3"
                        value={selectedScheduleId}
                        onChange={(e) => setSelectedScheduleId(e.target.value)}
                        required
                    >
                        <option value="">Выберите расписание</option>
                        {schedules.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name} ({s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)})
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="btn-solid-green mt-4" style={{ width: '100%' }}>
                        Начать работу
                    </button>
                </form>
            </div>
        );
    }

    const currentUser = colleagues.find(c => c.isCurrentUser);
    const sortedColleagues = [...colleagues].sort((a, b) =>
        a.isCurrentUser === b.isCurrentUser ? 0 : a.isCurrentUser ? -1 : 1
    );
    const breaksRemaining = currentShift?.breaks
        ? Math.max(0, 2 - currentShift.breaks.filter((b: any) => b.status === 'Finished').length)
        : 0;

    return (
        <div className="dashboard-layout">
            <div>
                <div className="panel-main">
                    {currentUser && (
                        <h2 style={{ fontSize: '32px', marginBottom: '32px', marginTop: 0 }}>
                            (Вы) {currentUser.userName}
                        </h2>
                    )}
                    <table className="borderless-table">
                        <thead>
                            <tr>
                                <th>Имя</th>
                                <th>Статус</th>
                                <th>Перерывов</th>
                                <th>Таймер</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedColleagues.map(c => {
                                const isOnBreak = c.activeBreaksCount > 0;
                                return (
                                    <tr key={c.userId}>
                                        <td>
                                            <div className="user-name-cell">
                                                {!c.isCurrentUser && <span className="user-icon">👤</span>}
                                                <span className={c.isCurrentUser ? 'fw-bold' : 'fw-medium'}>
                                                    {c.isCurrentUser ? `(Вы) ${c.userName}` : c.userName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={`fw-bold ${isOnBreak ? 'text-red' : 'text-green'}`}>
                                            {isOnBreak ? 'Перерыв' : 'В линии'}
                                        </td>
                                        <td>{c.completedBreaksCount}/2</td>
                                        <td className="tabular-nums text-muted fw-medium">
                                            {c.isCurrentUser && !isOnBreak
                                                ? formatDuration(shiftElapsed)
                                                : (isOnBreak ? '15:03 (20)' : '02:34:42')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <BreakQueue activeBreak={activeBreak} onBreakStateChange={loadData} />
            </div>

            <div>
                <div className="panel-side shift-status-card">
                    <div className="shift-status-header">
                        <span className="fw-bold">Смена</span>
                        <span className="tabular-nums fw-medium">
                            {currentShift.schedule?.startTime.slice(0, 5)}-{currentShift.schedule?.endTime.slice(0, 5)}
                        </span>
                    </div>
                    <div className="text-muted mt-3" style={{ fontSize: '14px' }}>
                        Перерывов осталось: {breaksRemaining}
                    </div>
                    <div className="shift-emoji">
                        {activeBreak ? '☕' : '🫡'}
                    </div>
                    <div className="shift-main-timer">
                        {activeBreak ? formatDuration(breakRemaining) : formatDuration(shiftElapsed)}
                    </div>
                    {activeBreak && (
                        <button className="btn-solid-red" onClick={handleEndBreak}>
                            На месте
                        </button>
                    )}
                    <div className="text-muted mt-4 fw-medium" style={{ fontSize: '14px' }}>
                        Перерывов свободно: {poolInfo?.availableBreaks || 0} // ✅
                    </div>
                </div>

                <div className="panel-side" style={{ marginBottom: 0 }}>
                    <h3 className="roles-title">Сегодня на смене</h3>
                    <div className="role-group">
                        <div className="role-label">Лиды</div>
                        <div className="role-items">
                            <div className="role-item">
                                <span className="pill-badge-green">Саша</span>
                                <span className="tabular-nums fw-medium text-muted">16-00</span>
                            </div>
                            <div className="role-item">
                                <span className="pill-badge-green">Настя</span>
                                <span className="tabular-nums fw-medium text-muted">16-00</span>
                            </div>
                        </div>
                    </div>
                    <div className="role-group">
                        <div className="role-label">Координатор</div>
                        <div className="role-items">
                            <div className="role-item">
                                <span className="pill-badge-green">Ирина</span>
                                <span className="tabular-nums fw-medium text-muted">10-19</span>
                            </div>
                        </div>
                    </div>
                    <div className="role-group" style={{ marginBottom: 0 }}>
                        <div className="role-label">Админы</div>
                        <div className="role-items">
                            <div className="role-item">
                                <span className="pill-badge-green">Вася</span>
                                <span className="tabular-nums fw-medium text-muted">16-00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

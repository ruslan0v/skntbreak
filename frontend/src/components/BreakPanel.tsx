import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import toast from 'react-hot-toast';

interface ActiveBreak {
    id: number;
    breakNumber: number;
    durationMinutes: number;
    startTime: string;
    expectedEndTime: string;
    elapsedTime: string;
    remainingTime: string;
    isOverdue: boolean;
}

interface BreakPanelProps {
    onBreakStarted?: () => void;
    onBreakEnded?: () => void;
}

export const BreakPanel: React.FC<BreakPanelProps> = ({ onBreakStarted, onBreakEnded }) => {
    const [activeBreak, setActiveBreak] = useState<ActiveBreak | null>(null);
    const [loading, setLoading] = useState(false);
    const [remainingMinutes, setRemainingMinutes] = useState(0);
    const [elapsedMinutes, setElapsedMinutes] = useState(0);

    useEffect(() => {
        loadActiveBreak();
        const interval = setInterval(loadActiveBreak, 10000); // Обновляем каждые 10 сек
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!activeBreak) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(activeBreak.startTime).getTime();
            const elapsed = Math.floor((now - start) / 60000);
            const remaining = activeBreak.durationMinutes - elapsed;

            setElapsedMinutes(elapsed);
            setRemainingMinutes(Math.max(0, remaining));
        }, 1000);

        return () => clearInterval(interval);
    }, [activeBreak]);

    const loadActiveBreak = async () => {
        try {
            const response = await api.Breaks.getMyActiveBreak();
            if (response.data.hasActiveBreak) {
                setActiveBreak(response.data.breakData);
            } else {
                setActiveBreak(null);
            }
        } catch (err) {
            console.error('Error loading active break:', err);
        }
    };

    const handleStartBreak = async () => {
        if (window.confirm('Взять перерыв?')) {
            try {
                setLoading(true);
                await api.Breaks.startBreak(1, 20); // breakNumber=1, duration=20мин
                toast.success('Перерыв начат!');
                await loadActiveBreak();
                onBreakStarted?.();
            } catch (err: any) {
                toast.error(err.response?.data?.error || 'Ошибка начала перерыва');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEndBreak = async () => {
        if (!activeBreak) return;

        if (window.confirm('Завершить перерыв?')) {
            try {
                setLoading(true);
                await api.Breaks.endBreak(activeBreak.id);
                toast.success('Перерыв завершён!');
                setActiveBreak(null);
                onBreakEnded?.();
            } catch (err: any) {
                toast.error(err.response?.data?.error || 'Ошибка завершения перерыва');
            } finally {
                setLoading(false);
            }
        }
    };

    if (activeBreak) {
        const isOverdue = remainingMinutes <= 0;

        return (
            <div className="card" style={{
                border: isOverdue ? '2px solid #ef4444' : '2px solid #10b981',
                backgroundColor: isOverdue ? '#fee' : '#f0fdf4'
            }}>
                <h3 style={{ color: isOverdue ? '#dc2626' : '#16a34a' }}>
                    {isOverdue ? '⚠️ Перерыв просрочен!' : '☕ Вы на перерыве'}
                </h3>
                <div style={{ marginBottom: '1rem' }}>
                    <p><strong>Перерыв #{activeBreak.breakNumber}</strong></p>
                    <p><strong>Длительность:</strong> {activeBreak.durationMinutes} минут</p>
                    <p><strong>Начало:</strong> {new Date(activeBreak.startTime).toLocaleTimeString('ru-RU')}</p>
                    <p><strong>Прошло:</strong> {elapsedMinutes} мин</p>
                    <p style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: isOverdue ? '#dc2626' : '#16a34a'
                    }}>
                        {isOverdue ? `Просрочено на ${Math.abs(remainingMinutes)} мин` : `Осталось: ${remainingMinutes} мин`}
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleEndBreak}
                    disabled={loading}
                >
                    Завершить перерыв
                </button>
            </div>
        );
    }

    return (
        <div className="card">
            <h3>Перерыв</h3>
            <p style={{ marginBottom: '1rem' }}>У вас нет активного перерыва</p>
            <button
                className="btn btn-primary"
                onClick={handleStartBreak}
                disabled={loading}
            >
                ☕ Взять перерыв
            </button>
        </div>
    );
};

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
    onBreakEnded?: () => void;
}

export const BreakPanel: React.FC<BreakPanelProps> = ({ onBreakEnded }) => {
    const = useState<ActiveBreak | null>(null);
    const [loading, setLoading] = useState(false);
    const = useState(0);
    const [elapsedMinutes, setElapsedMinutes] = useState(0);

    useEffect(() => {
        loadActiveBreak();
        const interval = setInterval(loadActiveBreak, 10000); 
        return () => clearInterval(interval);
    },);

    // Исключительно презентационный таймер без вызовов API
    useEffect(() => {
        if (!activeBreak) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(activeBreak.startTime).getTime();
            const elapsed = Math.floor((now - start) / 60000);
            const remaining = activeBreak.durationMinutes - elapsed;

            setElapsedMinutes(elapsed);
            setRemainingMinutes(remaining); // Позволяем уходить в минус для отображения просрочки
        }, 1000);

        return () => clearInterval(interval);
    },);

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
                toast.error(err.response?.data?.error |

| 'Ошибка завершения перерыва');
            } finally {
                setLoading(false);
            }
        }
    };

    if (activeBreak) {
        const isOverdue = remainingMinutes < 0;
        return (
            <div className="card" style={{
                border: isOverdue? '2px solid #ef4444' : '2px solid #10b981',
                backgroundColor: isOverdue? '#fee' : '#f0fdf4'
            }}>
                <h3 style={{ color: isOverdue? '#dc2626' : '#16a34a' }}>
                    {isOverdue? '⚠️ Перерыв просрочен!' : '☕ Вы на перерыве'}
                </h3>
                <div style={{ marginBottom: '1rem' }}>
                    <p><strong>Перерыв #{activeBreak.breakNumber}</strong></p>
                    <p><strong>Длительность:</strong> {activeBreak.durationMinutes} минут</p>
                    <p><strong>Начало:</strong> {new Date(activeBreak.startTime).toLocaleTimeString('ru-RU')}</p>
                    <p><strong>Прошло:</strong> {elapsedMinutes} мин</p>
                    <p style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: isOverdue? '#dc2626' : '#16a34a'
                    }}>
                        {isOverdue? `Просрочено на ${Math.abs(remainingMinutes)} мин` : `Осталось: ${remainingMinutes} мин`}
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
            <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Для начала отдыха встаньте в очередь.</p>
        </div>
    );
};

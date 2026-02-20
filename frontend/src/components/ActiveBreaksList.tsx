import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

interface ActiveBreak {
    id: number;
    userId: number;
    userName: string;
    breakNumber: number;
    durationMinutes: number;
    startTime: string;
    isOverdue: boolean;
}

export const ActiveBreaksList: React.FC = () => {
    const [breaks, setBreaks] = useState<ActiveBreak[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActiveBreaks();
        const interval = setInterval(loadActiveBreaks, 15000); // Обновляем каждые 15 сек
        return () => clearInterval(interval);
    }, []);

    const loadActiveBreaks = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await api.Breaks.getActiveBreaksInShift(today);
            setBreaks(response.data);
        } catch (err) {
            console.error('Error loading active breaks:', err);
        } finally {
            setLoading(false);
        }
    };

    const getElapsedMinutes = (startTime: string) => {
        const now = new Date().getTime();
        const start = new Date(startTime).getTime();
        return Math.floor((now - start) / 60000);
    };

    if (loading) {
        return <div className="card"><p>Загрузка...</p></div>;
    }

    return (
        <div className="card">
            <h3>Активные перерывы в смене ({breaks.length})</h3>
            {breaks.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>
                    Никто сейчас не на перерыве
                </p>
            ) : (
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {breaks.map((brk) => {
                        const elapsed = getElapsedMinutes(brk.startTime);
                        const remaining = Math.max(0, brk.durationMinutes - elapsed);
                        const isOverdue = remaining === 0;

                        return (
                            <div
                                key={brk.id}
                                style={{
                                    padding: '12px',
                                    border: `1px solid ${isOverdue ? '#fecaca' : '#d1fae5'}`,
                                    borderRadius: '8px',
                                    backgroundColor: isOverdue ? '#fef2f2' : '#f0fdf4',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div>
                                    <strong>{brk.userName}</strong>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                        Перерыв #{brk.breakNumber} • {brk.durationMinutes} мин
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 'bold',
                                        color: isOverdue ? '#dc2626' : '#16a34a'
                                    }}>
                                        {isOverdue ? '⚠️ Просрочен' : `${remaining} мин`}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                        {new Date(brk.startTime).toLocaleTimeString('ru-RU')}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

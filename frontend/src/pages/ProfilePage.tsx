import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import toast from 'react-hot-toast';

interface UserProfile {
    id: number;
    userName: string;
    login: string;
    role: string;
    totalShifts: number;
    totalBreaks: number;
    completedBreaks: number;
    skippedBreaks: number;
}

export const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [newUserName, setNewUserName] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await api.Users.getProfile();
            setProfile(response.data);
            setNewUserName(response.data.userName);
        } catch (err: any) {
            toast.error('Ошибка загрузки профиля');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!newUserName.trim()) {
            toast.error('Введите имя');
            return;
        }

        try {
            await api.Users.updateProfile({ userName: newUserName });
            toast.success('Профиль обновлён');
            setEditing(false);
            await loadProfile();
        } catch (err: any) {
            toast.error('Ошибка обновления профиля');
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Загрузка...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Профиль не найден</p>
            </div>
        );
    }

    return (
        <div style={{
            padding: '2rem',
            maxWidth: '800px',
            margin: '0 auto',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        }}>
            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '2rem'
            }}>
                Профиль
            </h2>

            {/* Основная информация */}
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem'
                        }}>
                            {profile.userName}
                        </h3>
                        <p style={{
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            margin: 0
                        }}>
                            @{profile.login}
                        </p>
                    </div>
                    <button
                        onClick={() => setEditing(!editing)}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: editing ? '#e5e7eb' : '#84cc16',
                            color: editing ? '#374151' : '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        {editing ? 'Отмена' : 'Редактировать'}
                    </button>
                </div>

                {editing && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            Имя пользователя
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleUpdateProfile}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#84cc16',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #e5e7eb'
                }}>
                    <div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            marginBottom: '0.25rem'
                        }}>
                            Роль
                        </div>
                        <div style={{ fontWeight: '500' }}>
                            {profile.role}
                        </div>
                    </div>
                </div>
            </div>

            {/* Статистика */}
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '1.5rem'
                }}>
                    Статистика
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1.5rem'
                }}>
                    <div style={{
                        padding: '1.5rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px'
                    }}>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: '600',
                            color: '#84cc16',
                            marginBottom: '0.5rem'
                        }}>
                            {profile.totalShifts}
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: '#6b7280'
                        }}>
                            Всего смен
                        </div>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px'
                    }}>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: '600',
                            color: '#84cc16',
                            marginBottom: '0.5rem'
                        }}>
                            {profile.totalBreaks}
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: '#6b7280'
                        }}>
                            Всего перерывов
                        </div>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px'
                    }}>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: '600',
                            color: '#10b981',
                            marginBottom: '0.5rem'
                        }}>
                            {profile.completedBreaks}
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: '#6b7280'
                        }}>
                            Завершённые
                        </div>
                    </div>

                    <div style={{
                        padding: '1.5rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px'
                    }}>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: '600',
                            color: '#ef4444',
                            marginBottom: '0.5rem'
                        }}>
                            {profile.skippedBreaks}
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: '#6b7280'
                        }}>
                            Пропущенные
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

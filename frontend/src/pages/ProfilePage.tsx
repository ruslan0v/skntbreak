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

    useEffect(() => {
        loadProfile();
    }, []); // ✅

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
            toast.error(err.response?.data?.error || 'Ошибка обновления профиля'); // ✅
        }
    };

    if (loading) {
        return <div className="text-muted fw-medium" style={{ padding: '40px', textAlign: 'center' }}>Загрузка профиля...</div>;
    }

    if (!profile) return null;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="day-text" style={{ marginBottom: '32px' }}>Профиль</h2>

            <div className="panel-main" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            backgroundColor: 'var(--bg-surface-side)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '32px'
                        }}>
                            👤
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#111827' }}>
                                {profile.userName}
                            </h3>
                            <div className="text-muted fw-medium" style={{ marginBottom: '8px' }}>
                                @{profile.login}
                            </div>
                            <span className="pill-badge-green">{profile.role}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setEditing(!editing)}
                        className="btn-outline-secondary"
                        style={{ padding: '8px 16px', fontSize: '14px', width: 'auto' }}
                    >
                        {editing ? 'Отмена' : 'Редактировать'}
                    </button>
                </div>

                {editing && (
                    <div style={{ marginTop: '32px', borderTop: '1px solid #E5E7EB', paddingTop: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                            Имя пользователя
                        </label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                                className="clean-input"
                                type="text"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                            />
                            <button className="btn-solid-green" onClick={handleUpdateProfile} style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                                Сохранить
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <h3 className="fw-bold" style={{ fontSize: '20px', marginBottom: '24px' }}>Статистика</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                <div className="panel-side" style={{ marginBottom: 0 }}>
                    <div className="text-muted fw-medium" style={{ fontSize: '14px', marginBottom: '8px' }}>Всего смен</div>
                    <div className="tabular-nums fw-bold text-main" style={{ fontSize: '40px', lineHeight: 1 }}>{profile.totalShifts}</div>
                </div>
                <div className="panel-side" style={{ marginBottom: 0 }}>
                    <div className="text-muted fw-medium" style={{ fontSize: '14px', marginBottom: '8px' }}>Всего перерывов</div>
                    <div className="tabular-nums fw-bold text-main" style={{ fontSize: '40px', lineHeight: 1 }}>{profile.totalBreaks}</div>
                </div>
                <div className="panel-side" style={{ marginBottom: 0 }}>
                    <div className="text-muted fw-medium" style={{ fontSize: '14px', marginBottom: '8px' }}>Завершённые перерывы</div>
                    <div className="tabular-nums fw-bold text-green" style={{ fontSize: '40px', lineHeight: 1 }}>{profile.completedBreaks}</div>
                </div>
                <div className="panel-side" style={{ marginBottom: 0 }}>
                    <div className="text-muted fw-medium" style={{ fontSize: '14px', marginBottom: '8px' }}>Пропущенные перерывы</div>
                    <div className="tabular-nums fw-bold text-red" style={{ fontSize: '40px', lineHeight: 1 }}>{profile.skippedBreaks}</div>
                </div>
            </div>
        </div>
    );
};

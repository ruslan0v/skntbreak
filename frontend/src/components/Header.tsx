import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { api } from '../api/client';

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const [time, setTime] = useState(new Date()); // ✅
    const [profile, setProfile] = useState<{ userName: string, role: string } | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []); // ✅

    useEffect(() => {
        api.Users.getProfile()
            .then(res => setProfile(res.data))
            .catch(() => console.error("Не удалось загрузить профиль"));
    }, []); // ✅

    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const dayName = days[time.getDay()]; // ✅

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="header-container">
            <div className="header-clock-module">
                <h1 className="day-text">{dayName}</h1>
                <div className="time-text">{formatTime(time)}</div>
            </div>
            <div className="header-profile">
                <div className="profile-info">
                    <span style={{ color: '#111827', fontSize: '16px' }}>
                        {profile?.userName || 'Загрузка...'}
                    </span>
                    <span className="profile-role">
                        {profile?.role === 'SL2' ? 'SL2' : profile?.role || ''}
                    </span>
                </div>
                <img
                    className="profile-avatar"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.userName || 'User'}&backgroundColor=F4F5F7`}
                    alt="avatar"
                />
                <button
                    className="logout-btn"
                    onClick={() => {
                        authService.logout();
                        navigate('/login');
                    }}
                >
                    Выход
                </button>
            </div>
        </div>
    );
};

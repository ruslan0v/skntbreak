import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface HeaderProps {
    userName?: string;
}

export const Header: React.FC<HeaderProps> = ({ userName = 'Пользователь' }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="header">
            <h1>📋 Skntbreak</h1>
            <div className="header-right">
                <div className="user-info">
                    <span>{userName}</span>
                </div>
                <button className="btn btn-secondary btn-small" onClick={handleLogout}>
                    Выход
                </button>
            </div>
        </div>
    );
};
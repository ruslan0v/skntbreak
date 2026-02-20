import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
    label: string;
    path: string;
    icon: string;
}

const navItems: NavItem[] = [
    { label: 'Дашборд', path: '/dashboard', icon: '📊' },
    { label: 'Перерывы', path: '/breaks', icon: '☕' },
    { label: 'Расписание', path: '/schedule', icon: '📅' },
    { label: 'Профиль', path: '/profile', icon: '👤' },
];

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="sidebar">
            <div className="nav-logo">📋 Skntbreak</div>
            <nav className="nav-items">
                {navItems.map((item) => (
                    <div
                        key={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </nav>
        </div>
    );
};
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
    label: string;
    path: string;
    icon: string;
}

const navItems: NavItem[] = [
    { label: 'Р”Р°С€Р±РѕСЂРґ', path: '/dashboard', icon: 'рџ“Љ' },
    { label: 'РџРµСЂРµСЂС‹РІС‹', path: '/breaks', icon: 'в•' },
    { label: 'Р Р°СЃРїРёСЃР°РЅРёРµ', path: '/schedule', icon: 'рџ“…' },
    { label: 'РџСЂРѕС„РёР»СЊ', path: '/profile', icon: 'рџ‘¤' },
];

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="sidebar">
            <div className="nav-logo">рџ“‹ Skntbreak</div>
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

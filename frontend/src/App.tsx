import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { Header } from './components/Header';
import './App.css';

// Простая проверка наличия JWT токена в localStorage
const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('token');
};

// Компонент-защитник маршрутов
const RequireAuth = () => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};

// Главная оболочка (Layout) приложения для авторизованных пользователей
const AppShell = () => {
    return (
        <div className="app">
            <div className="app__main">
                {/* Хедер с часами и профилем теперь заменяет боковое меню */}
                <Header />
                <main className="app__content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default function App() {
    return (
        <>
            {/* Глобальная настройка уведомлений под новую светлую стилистику */}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        borderRadius: '16px',
                        background: '#F8F9FB', // Подложка как у основных карточек
                        color: '#111827',
                        fontWeight: 500,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        padding: '16px 24px',
                    },
                    success: {
                        iconTheme: {
                            primary: '#7CCC63',
                            secondary: '#FFFFFF',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#C13333',
                            secondary: '#FFFFFF',
                        },
                    },
                }}
            />

            <BrowserRouter>
                <Routes>
                    {/* Публичные маршруты аутентификации */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Защищенные маршруты (доступны только после входа) */}
                    <Route element={<RequireAuth />}>
                        <Route element={<AppShell />}>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/admin" element={<AdminPage />} />
                        </Route>
                    </Route>

                    {/* Перехват неизвестных URL-адресов */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}
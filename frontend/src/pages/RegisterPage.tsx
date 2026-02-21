import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
    const [userName, setUserName] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Пароли не совпадают');
            return;
        }

        setLoading(true);
        try {
            await api.Users.register(userName, login, password);
            toast.success('Регистрация успешна! Теперь вы можете войти.');
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка при регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2 className="day-text" style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px' }}>
                    Регистрация
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                            Имя пользователя (Отображаемое)
                        </label>
                        <input
                            className="clean-input"
                            type="text"
                            placeholder="Например: Иван Иванов"
                            value={userName}
                            onChange={e => setUserName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                            Логин
                        </label>
                        <input
                            className="clean-input"
                            type="text"
                            placeholder="ivanov"
                            value={login}
                            onChange={e => setLogin(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                            Пароль
                        </label>
                        <input
                            className="clean-input"
                            type="password"
                            placeholder="Минимум 6 символов"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                            Подтвердите пароль
                        </label>
                        <input
                            className="clean-input"
                            type="password"
                            placeholder="Повторите пароль"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button className="btn-solid-green" type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Создание...' : 'Создать аккаунт'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <Link to="/login" className="text-muted fw-medium" style={{ textDecoration: 'none', transition: 'color 0.2s' }}>
                        Уже есть аккаунт? <span className="text-green">Войти</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};
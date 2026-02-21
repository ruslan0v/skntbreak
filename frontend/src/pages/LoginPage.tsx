import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, setAuthToken } from '../api/client';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.Users.login(login, password);
            // Сохраняем токен и устанавливаем его в axios
            setAuthToken(response.data.token);
            toast.success('Вход выполнен успешно!');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка авторизации. Проверьте логин и пароль.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2 className="day-text" style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px' }}>
                    Вход в систему
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                            Логин
                        </label>
                        <input
                            className="clean-input"
                            type="text"
                            placeholder="Введите логин"
                            value={login}
                            onChange={e => setLogin(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                            Пароль
                        </label>
                        <input
                            className="clean-input"
                            type="password"
                            placeholder="Введите пароль"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button className="btn-solid-green" type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Загрузка...' : 'Войти'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <Link to="/register" className="text-muted fw-medium" style={{ textDecoration: 'none', transition: 'color 0.2s' }}>
                        Нет аккаунта? <span className="text-green">Зарегистрироваться</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};
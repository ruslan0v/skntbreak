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
            toast.error('РџР°СЂРѕР»Рё РЅРµ СЃРѕРІРїР°РґР°СЋС‚');
            return;
        }

        setLoading(true);
        try {
            await api.Users.register(userName, login, password);
            toast.success('Р РµРіРёСЃС‚СЂР°С†РёСЏ СѓСЃРїРµС€РЅР°! РўРµРїРµСЂСЊ РІС‹ РјРѕР¶РµС‚Рµ РІРѕР№С‚Рё.');
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'РћС€РёР±РєР° РїСЂРё СЂРµРіРёСЃС‚СЂР°С†РёРё');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2 className="day-text" style={{ textAlign: 'center', marginBottom: '40px', fontSize: '32px' }}>
                    Р РµРіРёСЃС‚СЂР°С†РёСЏ
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                            РРјСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ (РћС‚РѕР±СЂР°Р¶Р°РµРјРѕРµ)
                        </label>
                        <input
                            className="clean-input"
                            type="text"
                            placeholder="РќР°РїСЂРёРјРµСЂ: РРІР°РЅ РРІР°РЅРѕРІ"
                            value={userName}
                            onChange={e => setUserName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                            Р›РѕРіРёРЅ
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
                            РџР°СЂРѕР»СЊ
                        </label>
                        <input
                            className="clean-input"
                            type="password"
                            placeholder="РњРёРЅРёРјСѓРј 6 СЃРёРјРІРѕР»РѕРІ"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#374151', fontSize: '14px' }}>
                            РџРѕРґС‚РІРµСЂРґРёС‚Рµ РїР°СЂРѕР»СЊ
                        </label>
                        <input
                            className="clean-input"
                            type="password"
                            placeholder="РџРѕРІС‚РѕСЂРёС‚Рµ РїР°СЂРѕР»СЊ"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button className="btn-solid-green" type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'РЎРѕР·РґР°РЅРёРµ...' : 'РЎРѕР·РґР°С‚СЊ Р°РєРєР°СѓРЅС‚'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <Link to="/login" className="text-muted fw-medium" style={{ textDecoration: 'none', transition: 'color 0.2s' }}>
                        РЈР¶Рµ РµСЃС‚СЊ Р°РєРєР°СѓРЅС‚? <span className="text-green">Р’РѕР№С‚Рё</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

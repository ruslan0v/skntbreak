import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import toast from 'react-hot-toast';

interface Schedule {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    shiftType?: number;
}

interface User {
    id: number;
    userName: string;
    login: string;
    role: string;
    totalShifts: number;
    totalBreaks: number;
    completedBreaks: number;
    skippedBreaks: number;
}

interface DashboardStats {
    totalUsers: number;
    totalShiftsToday: number;
    activeBreaks: number;
    completedBreaksToday: number;
    skippedBreaksToday: number;
    totalBreaksToday: number;
}

interface BreakPool {
    id: number;
    group: string;
    workDate: string;
    maxCurrentBreaks: number;
    currentBreaksCount: number;
    availableBreaksCount: number;
}

interface UserShift {
    id: number;
    userId: number;
    userName: string;
    scheduleName: string;
    workDate: string;
    group: string;
    totalBreaks: number;
    activeBreaks: number;
    completedBreaks: number;
    skippedBreaks: number;
}

type TabType = 'stats' | 'schedules' | 'users' | 'breaks' | 'shifts';

const StatCard = React.memo(({ label, value, colorClass }: { label: string, value: number, colorClass: string }) => (
    <div className="panel-side" style={{ marginBottom: 0, padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="text-muted fw-medium" style={{ fontSize: '14px' }}>{label}</div>
        <div className={`tabular-nums fw-bold ${colorClass}`} style={{ fontSize: '36px', lineHeight: 1 }}>{value}</div>
    </div>
));

const FormField = React.memo(({ label, type, value, onChange, placeholder, required, min }: any) => (
    <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>{label}</label>
        <input className="clean-input" type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} min={min} />
    </div>
));

export const AdminPage: React.FC = () => {
    // ✅ Все useState с деструктурированием
    const [activeTab, setActiveTab] = useState<TabType>('stats');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [breakPools, setBreakPools] = useState<BreakPool[]>([]);
    const [todayShifts, setTodayShifts] = useState<UserShift[]>([]);
    const [loading, setLoading] = useState(true);

    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [showBreakPoolForm, setShowBreakPoolForm] = useState(false);

    const [newSchedule, setNewSchedule] = useState({ name: '', startTime: '', endTime: '', shiftType: 0 });
    const [newUser, setNewUser] = useState({ userName: '', login: '', password: '', role: 'SL1' });
    const [newBreakPool, setNewBreakPool] = useState({
        workDate: new Date().toISOString().split('T')[0], // ✅ строка, не массив
        group: 0,
        maxCurrentBreaks: 5
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            if (activeTab === 'stats') {
                const response = await api.Admin.getDashboardStats();
                setStats(response.data);
            } else if (activeTab === 'schedules') {
                const response = await api.Schedules.getAllSchedules();
                setSchedules(response.data);
            } else if (activeTab === 'users') {
                const response = await api.Admin.getAllUsers();
                setUsers(response.data);
            } else if (activeTab === 'breaks') {
                const response = await api.Admin.getAllBreakPools();
                setBreakPools(response.data);
            } else if (activeTab === 'shifts') {
                const response = await api.Admin.getTodayShifts();
                setTodayShifts(response.data);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка загрузки данных'); // ✅
        } finally {
            setLoading(false);
        }
    }, [activeTab]); // ✅

    useEffect(() => {
        loadData();
    }, [loadData]); // ✅

    const handleCreateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSchedule.name || !newSchedule.startTime || !newSchedule.endTime) {
            toast.error('Заполните все обязательные поля');
            return;
        }
        try {
            await api.Schedules.createSchedule({
                name: newSchedule.name,
                startTime: newSchedule.startTime,
                endTime: newSchedule.endTime,
                shiftType: newSchedule.shiftType,
            });
            toast.success('График успешно создан');
            setShowScheduleForm(false);
            setNewSchedule({ name: '', startTime: '', endTime: '', shiftType: 0 });
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка создания графика'); // ✅
        }
    };

    const handleDeleteSchedule = async (id: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот график?')) return;
        try {
            await api.Schedules.deleteSchedule(id);
            toast.success('График удалён');
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка удаления графика'); // ✅
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.userName || !newUser.login || !newUser.password) {
            toast.error('Заполните все обязательные поля');
            return;
        }
        try {
            await api.Admin.createUser({
                userName: newUser.userName,
                login: newUser.login,
                password: newUser.password,
                role: newUser.role,
            });
            toast.success('Пользователь создан');
            setShowUserForm(false);
            setNewUser({ userName: '', login: '', password: '', role: 'SL1' });
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка создания пользователя'); // ✅
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!window.confirm('Вы действительно хотите удалить пользователя?')) return;
        try {
            await api.Admin.deleteUser(id);
            toast.success('Пользователь удалён');
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка удаления пользователя'); // ✅
        }
    };

    const handleCreateBreakPool = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.Admin.createBreakPool({
                workDate: newBreakPool.workDate,
                group: newBreakPool.group,
                maxCurrentBreaks: newBreakPool.maxCurrentBreaks,
            });
            toast.success('Пул перерывов обновлён');
            setShowBreakPoolForm(false);
            setNewBreakPool({
                workDate: new Date().toISOString().split('T')[0], // ✅
                group: 0,
                maxCurrentBreaks: 5
            });
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка управления пулом'); // ✅
        }
    };

    const handleEndUserShift = async (shiftId: number) => {
        if (!window.confirm('Принудительно завершить смену этого сотрудника?')) return;
        try {
            await api.Admin.endUserShift(shiftId);
            toast.success('Смена завершена');
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка завершения смены'); // ✅
        }
    };

    const dangerGhostBtnStyle = {
        backgroundColor: '#FEE2E2',
        color: '#C13333',
        border: 'none',
        borderRadius: '9999px',
        padding: '6px 16px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'opacity 0.2s'
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 className="day-text" style={{ marginBottom: '32px' }}>Панель администратора</h2>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <button className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Статистика</button>
                <button className={`tab-button ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Пользователи</button>
                <button className={`tab-button ${activeTab === 'schedules' ? 'active' : ''}`} onClick={() => setActiveTab('schedules')}>Графики</button>
                <button className={`tab-button ${activeTab === 'breaks' ? 'active' : ''}`} onClick={() => setActiveTab('breaks')}>Пулы перерывов</button>
                <button className={`tab-button ${activeTab === 'shifts' ? 'active' : ''}`} onClick={() => setActiveTab('shifts')}>Смены сегодня</button>
            </div>

            {loading ? (
                <div className="text-muted fw-medium" style={{ textAlign: 'center', padding: '40px' }}>Загрузка данных...</div>
            ) : (
                <div className="panel-main">

                    {activeTab === 'stats' && stats && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                            <StatCard label="Всего пользователей" value={stats.totalUsers} colorClass="text-primary" />
                            <StatCard label="Смен сегодня" value={stats.totalShiftsToday} colorClass="text-primary" />
                            <StatCard label="Активных перерывов" value={stats.activeBreaks} colorClass="text-red" />
                            <StatCard label="Завершено перерывов" value={stats.completedBreaksToday} colorClass="text-green" />
                            <StatCard label="Пропущено перерывов" value={stats.skippedBreaksToday} colorClass="text-muted" />
                            <StatCard label="Всего перерывов (за день)" value={stats.totalBreaksToday} colorClass="text-primary" />
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                                <button className="btn-solid-green" onClick={() => setShowUserForm(!showUserForm)} style={{ width: 'auto' }}>
                                    {showUserForm ? 'Отменить' : '+ Создать пользователя'}
                                </button>
                            </div>
                            {showUserForm && (
                                <form onSubmit={handleCreateUser} className="panel-side" style={{ marginBottom: '32px' }}>
                                    <h3 className="fw-bold" style={{ marginTop: 0, marginBottom: '24px' }}>Новый пользователь</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <FormField label="Имя" type="text" value={newUser.userName} onChange={(e: any) => setNewUser({ ...newUser, userName: e.target.value })} required />
                                        <FormField label="Логин" type="text" value={newUser.login} onChange={(e: any) => setNewUser({ ...newUser, login: e.target.value })} required />
                                        <FormField label="Пароль" type="password" value={newUser.password} onChange={(e: any) => setNewUser({ ...newUser, password: e.target.value })} required />
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Роль</label>
                                            <select className="clean-input" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                                                <option value="SL1">SL1</option>
                                                <option value="SL2">SL2</option>
                                                <option value="Chatter">Chatter</option>
                                                <option value="TeamLead">Team Lead</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-solid-green mt-3" style={{ width: 'auto' }}>Сохранить</button>
                                </form>
                            )}
                            {users.length === 0 ? (
                                <div className="text-muted fw-medium" style={{ textAlign: 'center' }}>Нет пользователей</div>
                            ) : (
                                <table className="borderless-table">
                                    <thead>
                                        <tr>
                                            <th>Имя</th><th>Логин</th><th>Роль</th><th>Смены</th><th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id}>
                                                <td className="fw-medium">{u.userName}</td>
                                                <td className="text-muted">{u.login}</td>
                                                <td><span className="pill-badge-green" style={{ backgroundColor: u.role === 'Admin' ? '#C13333' : '#7CCC63' }}>{u.role}</span></td>
                                                <td className="tabular-nums">{u.totalShifts}</td>
                                                <td><button onClick={() => handleDeleteUser(u.id)} style={dangerGhostBtnStyle}>Удалить</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}

                    {activeTab === 'schedules' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                                <button className="btn-solid-green" onClick={() => setShowScheduleForm(!showScheduleForm)} style={{ width: 'auto' }}>
                                    {showScheduleForm ? 'Отменить' : '+ Создать график'}
                                </button>
                            </div>
                            {showScheduleForm && (
                                <form onSubmit={handleCreateSchedule} className="panel-side" style={{ marginBottom: '32px' }}>
                                    <h3 className="fw-bold" style={{ marginTop: 0, marginBottom: '24px' }}>Новый график</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <FormField label="Название (напр. Общий 09:00)" type="text" value={newSchedule.name} onChange={(e: any) => setNewSchedule({ ...newSchedule, name: e.target.value })} required />
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Тип смены</label>
                                            <select className="clean-input" value={newSchedule.shiftType} onChange={(e) => setNewSchedule({ ...newSchedule, shiftType: parseInt(e.target.value) })}>
                                                <option value={0}>Дневная (Day)</option>
                                                <option value={1}>Вечерняя (Evening)</option>
                                            </select>
                                        </div>
                                        <FormField label="Время начала" type="time" value={newSchedule.startTime} onChange={(e: any) => setNewSchedule({ ...newSchedule, startTime: e.target.value })} required />
                                        <FormField label="Время окончания" type="time" value={newSchedule.endTime} onChange={(e: any) => setNewSchedule({ ...newSchedule, endTime: e.target.value })} required />
                                    </div>
                                    <button type="submit" className="btn-solid-green mt-3" style={{ width: 'auto' }}>Создать</button>
                                </form>
                            )}
                            {schedules.length === 0 ? (
                                <div className="text-muted fw-medium" style={{ textAlign: 'center' }}>Нет графиков</div>
                            ) : (
                                <table className="borderless-table">
                                    <thead>
                                        <tr>
                                            <th>Название</th><th>Тип</th><th>Время</th><th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedules.map((s) => (
                                            <tr key={s.id}>
                                                <td className="fw-medium">{s.name}</td>
                                                <td>{s.shiftType === 0 ? 'День' : 'Вечер'}</td>
                                                <td className="tabular-nums text-muted">{s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}</td>
                                                <td><button onClick={() => handleDeleteSchedule(s.id)} style={dangerGhostBtnStyle}>Удалить</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}

                    {activeTab === 'breaks' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                                <button className="btn-solid-green" onClick={() => setShowBreakPoolForm(!showBreakPoolForm)} style={{ width: 'auto' }}>
                                    {showBreakPoolForm ? 'Отменить' : '+ Изменить пул'}
                                </button>
                            </div>
                            {showBreakPoolForm && (
                                <form onSubmit={handleCreateBreakPool} className="panel-side" style={{ marginBottom: '32px' }}>
                                    <h3 className="fw-bold" style={{ marginTop: 0, marginBottom: '24px' }}>Управление пулом</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                        <FormField label="Дата" type="date" value={newBreakPool.workDate} onChange={(e: any) => setNewBreakPool({ ...newBreakPool, workDate: e.target.value })} required />
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Смена</label>
                                            <select className="clean-input" value={newBreakPool.group} onChange={(e) => setNewBreakPool({ ...newBreakPool, group: parseInt(e.target.value) })}>
                                                <option value={0}>Дневная (Day)</option>
                                                <option value={1}>Вечерняя (Evening)</option>
                                            </select>
                                        </div>
                                        <FormField label="Макс. мест (в линии)" type="number" min="1" value={newBreakPool.maxCurrentBreaks} onChange={(e: any) => setNewBreakPool({ ...newBreakPool, maxCurrentBreaks: parseInt(e.target.value) })} required />
                                    </div>
                                    <button type="submit" className="btn-solid-green mt-3" style={{ width: 'auto' }}>Применить</button>
                                </form>
                            )}
                            {breakPools.length === 0 ? (
                                <div className="text-muted fw-medium" style={{ textAlign: 'center' }}>Нет активных пулов</div>
                            ) : (
                                <table className="borderless-table">
                                    <thead>
                                        <tr>
                                            <th>Дата</th><th>Группа</th><th>Свободно мест</th><th>Всего мест</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {breakPools.map((pool) => (
                                            <tr key={pool.id}>
                                                <td className="tabular-nums fw-medium">{pool.workDate}</td>
                                                <td>{pool.group === 'Day' ? 'День' : 'Вечер'}</td>
                                                <td className="tabular-nums text-green fw-bold">{pool.availableBreaksCount}</td>
                                                <td className="tabular-nums text-muted">{pool.maxCurrentBreaks}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}

                    {activeTab === 'shifts' && (
                        <>
                            {todayShifts.length === 0 ? (
                                <div className="text-muted fw-medium" style={{ textAlign: 'center' }}>Сегодня нет активных смен</div>
                            ) : (
                                <table className="borderless-table">
                                    <thead>
                                        <tr>
                                            <th>Сотрудник</th><th>График</th><th>Группа</th><th>Статус перерывов</th><th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todayShifts.map((shift) => (
                                            <tr key={shift.id}>
                                                <td className="fw-medium">{shift.userName}</td>
                                                <td className="text-muted">{shift.scheduleName}</td>
                                                <td>{shift.group === 'Day' ? 'День' : 'Вечер'}</td>
                                                <td className="tabular-nums text-muted">
                                                    {shift.completedBreaks} / {shift.totalBreaks} ({shift.activeBreaks > 0 ? <span className="text-red">На перерыве</span> : 'В линии'})
                                                </td>
                                                <td>
                                                    <button onClick={() => handleEndUserShift(shift.id)} style={dangerGhostBtnStyle}>
                                                        Завершить смену
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

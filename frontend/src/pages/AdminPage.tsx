import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import toast from 'react-hot-toast';

// ========================================
// INTERFACES
// ========================================
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

// ========================================
// ВЫНЕСЕННЫЕ КОМПОНЕНТЫ (ВНЕ AdminPage!)
// ========================================

type TabButtonProps = {
    tab: TabType;
    label: string;
    activeTab: TabType;
    onClick: (tab: TabType) => void;
};

const TabButton = React.memo(({ tab, label, activeTab, onClick }: TabButtonProps) => (
    <button
        onClick={() => onClick(tab)}
        style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === tab ? '#84cc16' : '#fff',
            color: activeTab === tab ? '#fff' : '#6b7280',
            border: activeTab === tab ? 'none' : '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
        }}
    >
        {label}
    </button>
));

type StatCardProps = {
    label: string;
    value: number;
    color: string;
};

const StatCard = React.memo(({ label, value, color }: StatCardProps) => (
    <div
        style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
    >
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            {label}
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 600, color }}>{value}</div>
    </div>
));

type FormFieldProps = {
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    min?: string;
};

const FormField = React.memo(({
    label,
    type,
    value,
    onChange,
    placeholder,
    required,
    min,
}: FormFieldProps) => (
    <div>
        <label
            style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem',
            }}
        >
            {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            min={min}
            style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
            }}
        />
    </div>
));

type DataTableProps = {
    headers: string[];
    rows: React.ReactNode[][];
    emptyMessage: string;
};

const DataTable = React.memo(({ headers, rows, emptyMessage }: DataTableProps) => (
    <div
        style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
    >
        {rows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                {emptyMessage}
            </div>
        ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #f3f4f6', textAlign: 'left' }}>
                        {headers.map((header, i) => (
                            <th
                                key={i}
                                style={{
                                    padding: '12px 8px',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                }}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            {row.map((cell, j) => (
                                <td key={j} style={{ padding: '16px 8px', fontSize: '0.875rem' }}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
));

// ========================================
// MAIN COMPONENT
// ========================================
export const AdminPage: React.FC = () => {
    // STATE
    const [activeTab, setActiveTab] = useState<TabType>('stats');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [breakPools, setBreakPools] = useState<BreakPool[]>([]);
    const [todayShifts, setTodayShifts] = useState<UserShift[]>([]);
    const [loading, setLoading] = useState(true);

    // Form visibility
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [showBreakPoolForm, setShowBreakPoolForm] = useState(false);

    // Form data
    const [newSchedule, setNewSchedule] = useState({
        name: '',
        startTime: '',
        endTime: '',
        shiftType: 0,
    });

    const [newUser, setNewUser] = useState({
        userName: '',
        login: '',
        password: '',
        role: 'SL1',
    });

    const [newBreakPool, setNewBreakPool] = useState({
        workDate: new Date().toISOString().split('T')[0],
        group: 0,
        maxCurrentBreaks: 5,
    });

    // Load data when tab changes
    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
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
            toast.error(err.response?.data?.error || 'Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    // SCHEDULE HANDLERS
    const handleCreateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSchedule.name || !newSchedule.startTime || !newSchedule.endTime) {
            toast.error('Заполните все поля');
            return;
        }

        try {
            await api.Schedules.createSchedule({
                name: newSchedule.name,
                startTime: newSchedule.startTime,
                endTime: newSchedule.endTime,
                shiftType: newSchedule.shiftType,
            });
            toast.success('График создан');
            setShowScheduleForm(false);
            setNewSchedule({ name: '', startTime: '', endTime: '', shiftType: 0 });
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка создания графика');
        }
    };

    const handleDeleteSchedule = async (id: number) => {
        if (!window.confirm('Удалить график?')) return;

        try {
            await api.Schedules.deleteSchedule(id);
            toast.success('График удалён');
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка удаления графика');
        }
    };

    // USER HANDLERS
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.userName || !newUser.login || !newUser.password) {
            toast.error('Заполните все поля');
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
            toast.error(err.response?.data?.error || 'Ошибка создания пользователя');
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!window.confirm('Удалить пользователя?')) return;

        try {
            await api.Admin.deleteUser(id);
            toast.success('Пользователь удалён');
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка удаления пользователя');
        }
    };

    // BREAK POOL HANDLERS
    const handleCreateBreakPool = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await api.Admin.createBreakPool({
                workDate: newBreakPool.workDate,
                group: newBreakPool.group,
                maxCurrentBreaks: newBreakPool.maxCurrentBreaks,
            });
            toast.success('Пул перерывов создан/обновлён');
            setShowBreakPoolForm(false);
            setNewBreakPool({
                workDate: new Date().toISOString().split('T')[0],
                group: 0,
                maxCurrentBreaks: 5,
            });
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка создания пула перерывов');
        }
    };

    // SHIFT HANDLERS
    const handleEndUserShift = async (shiftId: number) => {
        if (!window.confirm('Завершить смену пользователя?')) return;

        try {
            await api.Admin.endUserShift(shiftId);
            toast.success('Смена завершена');
            await loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Ошибка завершения смены');
        }
    };

    // RENDER
    return (
        <div
            style={{
                padding: '2rem',
                maxWidth: '1400px',
                margin: '0 auto',
                backgroundColor: '#f5f5f5',
                minHeight: '100vh',
            }}
        >
            <h2
                style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '2rem',
                }}
            >
                Панель администратора
            </h2>

            {/* TABS */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <TabButton tab="stats" label="Статистика" activeTab={activeTab} onClick={setActiveTab} />
                <TabButton tab="schedules" label="Графики" activeTab={activeTab} onClick={setActiveTab} />
                <TabButton tab="users" label="Пользователи" activeTab={activeTab} onClick={setActiveTab} />
                <TabButton tab="breaks" label="Пулы перерывов" activeTab={activeTab} onClick={setActiveTab} />
                <TabButton tab="shifts" label="Смены сегодня" activeTab={activeTab} onClick={setActiveTab} />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>Загрузка...</p>
                </div>
            ) : (
                <>
                    {/* STATS TAB */}
                    {activeTab === 'stats' && stats && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '1.5rem',
                            }}
                        >
                            <StatCard label="Всего пользователей" value={stats.totalUsers} color="#84cc16" />
                            <StatCard label="Смен сегодня" value={stats.totalShiftsToday} color="#3b82f6" />
                            <StatCard label="Активных перерывов" value={stats.activeBreaks} color="#f59e0b" />
                            <StatCard label="Завершено перерывов" value={stats.completedBreaksToday} color="#10b981" />
                            <StatCard label="Пропущено перерывов" value={stats.skippedBreaksToday} color="#ef4444" />
                            <StatCard label="Всего перерывов" value={stats.totalBreaksToday} color="#6366f1" />
                        </div>
                    )}

                    {/* SCHEDULES TAB */}
                    {activeTab === 'schedules' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowScheduleForm(!showScheduleForm)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#84cc16',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {showScheduleForm ? 'Отмена' : '+ Создать график'}
                                </button>
                            </div>

                            {showScheduleForm && (
                                <div
                                    style={{
                                        backgroundColor: '#fff',
                                        borderRadius: '12px',
                                        padding: '2rem',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        marginBottom: '1.5rem',
                                    }}
                                >
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                                        Новый график
                                    </h3>
                                    <form onSubmit={handleCreateSchedule}>
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                                gap: '1rem',
                                                marginBottom: '1.5rem',
                                            }}
                                        >
                                            <FormField
                                                label="Название"
                                                type="text"
                                                value={newSchedule.name}
                                                onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                                                placeholder="Например: Утренняя смена"
                                                required
                                            />
                                            <FormField
                                                label="Время начала"
                                                type="time"
                                                value={newSchedule.startTime}
                                                onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                                                required
                                            />
                                            <FormField
                                                label="Время окончания"
                                                type="time"
                                                value={newSchedule.endTime}
                                                onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                                                required
                                            />
                                            <div>
                                                <label
                                                    style={{
                                                        display: 'block',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 500,
                                                        color: '#374151',
                                                        marginBottom: '0.5rem',
                                                    }}
                                                >
                                                    Смена
                                                </label>
                                                <select
                                                    value={newSchedule.shiftType}
                                                    onChange={(e) =>
                                                        setNewSchedule({ ...newSchedule, shiftType: parseInt(e.target.value) })
                                                    }
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '8px',
                                                        fontSize: '1rem',
                                                    }}
                                                >
                                                    <option value={0}>Дневная</option>
                                                    <option value={1}>Вечерняя</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                backgroundColor: '#84cc16',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Создать
                                        </button>
                                    </form>
                                </div>
                            )}

                            <DataTable
                                headers={['Название', 'Время', 'Смена', 'Действия']}
                                rows={schedules.map((s) => [
                                    s.name,
                                    `${s.startTime} - ${s.endTime}`,
                                    s.shiftType === 0 ? 'Дневная' : 'Вечерняя',
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => handleDeleteSchedule(s.id)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#fee',
                                            color: '#dc2626',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Удалить
                                    </button>,
                                ])}
                                emptyMessage="Графики не найдены"
                            />
                        </>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowUserForm(!showUserForm)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#84cc16',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {showUserForm ? 'Отмена' : '+ Создать пользователя'}
                                </button>
                            </div>

                            {showUserForm && (
                                <div
                                    style={{
                                        backgroundColor: '#fff',
                                        borderRadius: '12px',
                                        padding: '2rem',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        marginBottom: '1.5rem',
                                    }}
                                >
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                                        Новый пользователь
                                    </h3>
                                    <form onSubmit={handleCreateUser}>
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                                                gap: '1rem',
                                                marginBottom: '1.5rem',
                                            }}
                                        >
                                            <FormField
                                                label="Имя"
                                                type="text"
                                                value={newUser.userName}
                                                onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                                                placeholder="Иван Иванов"
                                                required
                                            />
                                            <FormField
                                                label="Логин"
                                                type="text"
                                                value={newUser.login}
                                                onChange={(e) => setNewUser({ ...newUser, login: e.target.value })}
                                                placeholder="ivanov"
                                                required
                                            />
                                            <FormField
                                                label="Пароль"
                                                type="password"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                required
                                            />
                                            <div>
                                                <label
                                                    style={{
                                                        display: 'block',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 500,
                                                        color: '#374151',
                                                        marginBottom: '0.5rem',
                                                    }}
                                                >
                                                    Роль
                                                </label>
                                                <select
                                                    value={newUser.role}
                                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '8px',
                                                        fontSize: '1rem',
                                                    }}
                                                >
                                                    <option value="SL1">SL1</option>
                                                    <option value="SL2">SL2</option>
                                                    <option value="Chatter">Chatter</option>
                                                    <option value="TeamLead">Team Lead</option>
                                                    <option value="Admin">Admin</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                backgroundColor: '#84cc16',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Создать
                                        </button>
                                    </form>
                                </div>
                            )}

                            <DataTable
                                headers={['Имя', 'Логин', 'Роль', 'Смены', 'Перерывы', 'Действия']}
                                rows={users.map((u) => [
                                    u.userName,
                                    u.login,
                                    u.role,
                                    u.totalShifts.toString(),
                                    `${u.completedBreaks} / ${u.totalBreaks}`,
                                    <button
                                        key={u.id}
                                        type="button"
                                        onClick={() => handleDeleteUser(u.id)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            backgroundColor: '#fee',
                                            color: '#dc2626',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Удалить
                                    </button>,
                                ])}
                                emptyMessage="Пользователи не найдены"
                            />
                        </>
                    )}

                    {/* BREAK POOLS TAB */}
                    {activeTab === 'breaks' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowBreakPoolForm(!showBreakPoolForm)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#84cc16',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {showBreakPoolForm ? 'Отмена' : '+ Создать пул'}
                                </button>
                            </div>

                            {showBreakPoolForm && (
                                <div
                                    style={{
                                        backgroundColor: '#fff',
                                        borderRadius: '12px',
                                        padding: '2rem',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        marginBottom: '1.5rem',
                                    }}
                                >
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                                        Новый пул перерывов
                                    </h3>
                                    <form onSubmit={handleCreateBreakPool}>
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '2fr 1fr 1fr',
                                                gap: '1rem',
                                                marginBottom: '1.5rem',
                                            }}
                                        >
                                            <FormField
                                                label="Дата"
                                                type="date"
                                                value={newBreakPool.workDate}
                                                onChange={(e) => setNewBreakPool({ ...newBreakPool, workDate: e.target.value })}
                                                required
                                            />
                                            <div>
                                                <label
                                                    style={{
                                                        display: 'block',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 500,
                                                        color: '#374151',
                                                        marginBottom: '0.5rem',
                                                    }}
                                                >
                                                    Смена
                                                </label>
                                                <select
                                                    value={newBreakPool.group}
                                                    onChange={(e) =>
                                                        setNewBreakPool({ ...newBreakPool, group: parseInt(e.target.value) })
                                                    }
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '8px',
                                                        fontSize: '1rem',
                                                    }}
                                                >
                                                    <option value={0}>Дневная</option>
                                                    <option value={1}>Вечерняя</option>
                                                </select>
                                            </div>
                                            <FormField
                                                label="Макс. одновременно"
                                                type="number"
                                                value={newBreakPool.maxCurrentBreaks.toString()}
                                                onChange={(e) =>
                                                    setNewBreakPool({
                                                        ...newBreakPool,
                                                        maxCurrentBreaks: parseInt(e.target.value),
                                                    })
                                                }
                                                min="1"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            style={{
                                                padding: '0.75rem 1.5rem',
                                                backgroundColor: '#84cc16',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Создать/Обновить
                                        </button>
                                    </form>
                                </div>
                            )}

                            <DataTable
                                headers={['Дата', 'Смена', 'Активных', 'Доступно', 'Максимум']}
                                rows={breakPools.map((bp) => [
                                    bp.workDate,
                                    bp.group,
                                    bp.currentBreaksCount.toString(),
                                    bp.availableBreaksCount.toString(),
                                    bp.maxCurrentBreaks.toString(),
                                ])}
                                emptyMessage="Пулы перерывов не найдены"
                            />
                        </>
                    )}

                    {/* SHIFTS TAB */}
                    {activeTab === 'shifts' && (
                        <DataTable
                            headers={[
                                'Пользователь',
                                'График',
                                'Дата',
                                'Смена',
                                'Всего перерывов',
                                'Активно',
                                'Завершено',
                                'Действия',
                            ]}
                            rows={todayShifts.map((shift) => [
                                shift.userName,
                                shift.scheduleName,
                                shift.workDate,
                                shift.group,
                                shift.totalBreaks.toString(),
                                shift.activeBreaks.toString(),
                                shift.completedBreaks.toString(),
                                <button
                                    key={shift.id}
                                    type="button"
                                    onClick={() => handleEndUserShift(shift.id)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#fef3c7',
                                        color: '#f59e0b',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Завершить
                                </button>,
                            ])}
                            emptyMessage="Смены сегодня не найдены"
                        />
                    )}
                </>
            )}
        </div>
    );
};

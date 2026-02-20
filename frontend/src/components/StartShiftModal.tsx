import React, { useState, useEffect } from 'react';
import { api } from '../apiclient';
import toast from 'react-hot-toast';
import { Schedule } from '../types'; // Убедитесь, что импорт правильный

interface StartShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const StartShiftModal: React.FC<StartShiftModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [scheduleId, setScheduleId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [workDate, setWorkDate] = useState(() => {
        const now = new Date();
        // Добавляем смещение часового пояса (для Москвы это -180 минут, т.е. +3 часа)
        // Но проще просто получить локальную дату в формате YYYY-MM-DD
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - (offset * 60000));
        return localDate.toISOString().split('T')[0];
    });
    // 1. Добавляем стейт для роли
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        try {
            // 2. Загружаем и графики, и профиль пользователя параллельно
            const [schedulesResponse, profileResponse] = await Promise.all([
                api.Schedules.getAllSchedules(),
                api.Users.getProfile()
            ]);

            setSchedules(schedulesResponse.data);
            setUserRole(profileResponse.data.role); // Сохраняем роль (SL1, SL2 и т.д.)

        } catch (err) {
            console.error('Error loading data:', err);
            toast.error('Ошибка загрузки данных');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scheduleId) {
            setError('Выберите график');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await api.Shifts.startShift({
                scheduleId: parseInt(scheduleId),
                // workDate отправлять не нужно, бэкенд берет текущую дату, 
                // но если у вас изменено API для приема даты:
                // workDate: workDate 
            });
            toast.success('Смена начата!');
            handleClose();
            onSuccess();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Не удалось начать смену';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setScheduleId('');
        setError('');
        onClose();
    };

    const selectedSchedule = schedules.find(s => s.id === parseInt(scheduleId));

    if (!isOpen) return null;

    // 3. Логика фильтрации
    const filteredSchedules = schedules.filter(schedule => {
        // Если пользователь Admin или TeamLead - показываем всё
        if (userRole === 'Admin' || userRole === 'TeamLead') return true;

        const name = schedule.name.toUpperCase();

        // Логика для SL1
        if (userRole === 'SL1') {
            // Показываем графики для SL1 и общие, скрываем явные SL2
            return !name.includes('SL2');
            // ИЛИ: return name.includes('SL1') || name.includes('ОБЩИЙ');
        }

        // Логика для SL2
        if (userRole === 'SL2') {
            // Показываем только SL2
            return name.includes('SL2');
        }

        return true; // Для остальных показываем всё
    });

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Начать смену</h3>
                    <button onClick={handleClose} className="close-btn">×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Выберите график</label>
                        <select
                            className="form-select"
                            value={scheduleId}
                            onChange={(e) => setScheduleId(e.target.value)}
                            required
                            disabled={loading}
                        >
                            <option value="">-- Не выбрано --</option>

                            {/* 4. Используем filteredSchedules вместо schedules */}
                            {filteredSchedules.map(schedule => (
                                <option key={schedule.id} value={schedule.id}>
                                    {schedule.name} ({schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedSchedule && (
                        <div className="info-box">
                            <p><strong>Тип смены:</strong> {selectedSchedule.shiftType === 0 ? 'Дневная' : 'Вечерняя'}</p>
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" onClick={handleClose} className="btn btn-secondary" disabled={loading}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Запуск...' : 'Начать смену'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { api } from '../apiclient';
import toast from 'react-hot-toast';
import { Schedule } from '../types'; // РЈР±РµРґРёС‚РµСЃСЊ, С‡С‚Рѕ РёРјРїРѕСЂС‚ РїСЂР°РІРёР»СЊРЅС‹Р№

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
        // Р”РѕР±Р°РІР»СЏРµРј СЃРјРµС‰РµРЅРёРµ С‡Р°СЃРѕРІРѕРіРѕ РїРѕСЏСЃР° (РґР»СЏ РњРѕСЃРєРІС‹ СЌС‚Рѕ -180 РјРёРЅСѓС‚, С‚.Рµ. +3 С‡Р°СЃР°)
        // РќРѕ РїСЂРѕС‰Рµ РїСЂРѕСЃС‚Рѕ РїРѕР»СѓС‡РёС‚СЊ Р»РѕРєР°Р»СЊРЅСѓСЋ РґР°С‚Сѓ РІ С„РѕСЂРјР°С‚Рµ YYYY-MM-DD
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - (offset * 60000));
        return localDate.toISOString().split('T')[0];
    });
    // 1. Р”РѕР±Р°РІР»СЏРµРј СЃС‚РµР№С‚ РґР»СЏ СЂРѕР»Рё
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen]);

    const loadData = async () => {
        try {
            // 2. Р—Р°РіСЂСѓР¶Р°РµРј Рё РіСЂР°С„РёРєРё, Рё РїСЂРѕС„РёР»СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РїР°СЂР°Р»Р»РµР»СЊРЅРѕ
            const [schedulesResponse, profileResponse] = await Promise.all([
                api.Schedules.getAllSchedules(),
                api.Users.getProfile()
            ]);

            setSchedules(schedulesResponse.data);
            setUserRole(profileResponse.data.role); // РЎРѕС…СЂР°РЅСЏРµРј СЂРѕР»СЊ (SL1, SL2 Рё С‚.Рґ.)

        } catch (err) {
            console.error('Error loading data:', err);
            toast.error('РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РґР°РЅРЅС‹С…');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scheduleId) {
            setError('Р’С‹Р±РµСЂРёС‚Рµ РіСЂР°С„РёРє');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await api.Shifts.startShift({
                scheduleId: parseInt(scheduleId),
                // workDate РѕС‚РїСЂР°РІР»СЏС‚СЊ РЅРµ РЅСѓР¶РЅРѕ, Р±СЌРєРµРЅРґ Р±РµСЂРµС‚ С‚РµРєСѓС‰СѓСЋ РґР°С‚Сѓ, 
                // РЅРѕ РµСЃР»Рё Сѓ РІР°СЃ РёР·РјРµРЅРµРЅРѕ API РґР»СЏ РїСЂРёРµРјР° РґР°С‚С‹:
                // workDate: workDate 
            });
            toast.success('РЎРјРµРЅР° РЅР°С‡Р°С‚Р°!');
            handleClose();
            onSuccess();
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'РќРµ СѓРґР°Р»РѕСЃСЊ РЅР°С‡Р°С‚СЊ СЃРјРµРЅСѓ';
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

    // 3. Р›РѕРіРёРєР° С„РёР»СЊС‚СЂР°С†РёРё
    const filteredSchedules = schedules.filter(schedule => {
        // Р•СЃР»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ Admin РёР»Рё TeamLead - РїРѕРєР°Р·С‹РІР°РµРј РІСЃС‘
        if (userRole === 'Admin' || userRole === 'TeamLead') return true;

        const name = schedule.name.toUpperCase();

        // Р›РѕРіРёРєР° РґР»СЏ SL1
        if (userRole === 'SL1') {
            // РџРѕРєР°Р·С‹РІР°РµРј РіСЂР°С„РёРєРё РґР»СЏ SL1 Рё РѕР±С‰РёРµ, СЃРєСЂС‹РІР°РµРј СЏРІРЅС‹Рµ SL2
            return !name.includes('SL2');
            // РР›Р: return name.includes('SL1') || name.includes('РћР‘Р©РР™');
        }

        // Р›РѕРіРёРєР° РґР»СЏ SL2
        if (userRole === 'SL2') {
            // РџРѕРєР°Р·С‹РІР°РµРј С‚РѕР»СЊРєРѕ SL2
            return name.includes('SL2');
        }

        return true; // Р”Р»СЏ РѕСЃС‚Р°Р»СЊРЅС‹С… РїРѕРєР°Р·С‹РІР°РµРј РІСЃС‘
    });

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>РќР°С‡Р°С‚СЊ СЃРјРµРЅСѓ</h3>
                    <button onClick={handleClose} className="close-btn">Г—</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Р’С‹Р±РµСЂРёС‚Рµ РіСЂР°С„РёРє</label>
                        <select
                            className="form-select"
                            value={scheduleId}
                            onChange={(e) => setScheduleId(e.target.value)}
                            required
                            disabled={loading}
                        >
                            <option value="">-- РќРµ РІС‹Р±СЂР°РЅРѕ --</option>

                            {/* 4. РСЃРїРѕР»СЊР·СѓРµРј filteredSchedules РІРјРµСЃС‚Рѕ schedules */}
                            {filteredSchedules.map(schedule => (
                                <option key={schedule.id} value={schedule.id}>
                                    {schedule.name} ({schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedSchedule && (
                        <div className="info-box">
                            <p><strong>РўРёРї СЃРјРµРЅС‹:</strong> {selectedSchedule.shiftType === 0 ? 'Р”РЅРµРІРЅР°СЏ' : 'Р’РµС‡РµСЂРЅСЏСЏ'}</p>
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" onClick={handleClose} className="btn btn-secondary" disabled={loading}>
                            РћС‚РјРµРЅР°
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Р—Р°РїСѓСЃРє...' : 'РќР°С‡Р°С‚СЊ СЃРјРµРЅСѓ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

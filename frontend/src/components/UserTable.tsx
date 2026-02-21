import React from 'react';
import { UserShift } from '../types/dashboard.types';
import { breaksService } from '../services/breaksService';

interface UserTableProps {
    data: UserShift[];
    onDelete?: (id: number) => Promise<void>;
}

export const UserTable: React.FC<UserTableProps> = ({ data, onDelete }) => {
    const handleDelete = async (id: number) => {
        if (window.confirm('Р’С‹ СѓРІРµСЂРµРЅС‹?')) {
            try {
                await onDelete?.(id);
            } catch (error) {
                console.error('Error deleting shift:', error);
            }
        }
    };

    if (data.length === 0) {
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th>Р”Р°С‚Р°</th>
                        <th>РЎРјРµРЅР°</th>
                        <th>Р Р°СЃРїРёСЃР°РЅРёРµ</th>
                        <th>РџРµСЂРµСЂС‹РІС‹</th>
                        <th>Р”РµР№СЃС‚РІРёСЏ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: '#9ca3af' }}>
                            РќРµС‚ РґР°РЅРЅС‹С…
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    }

    return (
        <table className="table">
            <thead>
                <tr>
                    <th>Р”Р°С‚Р°</th>
                    <th>РЎРјРµРЅР°</th>
                    <th>Р Р°СЃРїРёСЃР°РЅРёРµ</th>
                    <th>РџРµСЂРµСЂС‹РІС‹</th>
                    <th>Р”РµР№СЃС‚РІРёСЏ</th>
                </tr>
            </thead>
            <tbody>
                {data.map((shift) => (
                    <tr key={shift.id}>
                        <td>{shift.workDate}</td>
                        <td>{shift.group === 'Day' ? 'Р”РµРЅСЊ' : 'Р’РµС‡РµСЂ'}</td>
                        <td>{shift.schedule?.name || '-'}</td>
                        <td>
                            {shift.breaks?.length || 0} / {shift.breaks?.filter(b => b.status === 2).length || 0}
                        </td>
                        <td>
                            <button
                                className="btn btn-danger btn-small"
                                onClick={() => handleDelete(shift.id)}
                            >
                                РЈРґР°Р»РёС‚СЊ
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

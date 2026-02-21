import { useEffect, useState } from "react";
import { adminApi } from "../../api/admin";
import type { DashboardStatsDto, UserShiftDetailDto } from "../../types";
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import {
    Users,
    Clock,
    Coffee,
    CheckCircle,
    XCircle,
    BarChart3,
    Square,
} from "lucide-react";

export default function AdminOverview() {
    const [stats, setStats] = useState<DashboardStatsDto | null>(null);
    const [shifts, setShifts] = useState<UserShiftDetailDto[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try {
            const [s, sh] = await Promise.all([
                adminApi.getStats(),
                adminApi.getTodayShifts(),
            ]);
            setStats(s);
            setShifts(sh);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    const handleEndShift = async (id: number) => {
        if (!confirm("Завершить смену пользователя?")) return;
        try {
            await adminApi.endUserShift(id);
            load();
        } catch (err: any) {
            alert(err.response?.data?.error ?? "Ошибка");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-6 w-6 border-4 border-indigo-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard label="Пользователей" value={stats.totalUsers} icon={<Users size={20} />} color="indigo" />
                    <StatCard label="Смен сегодня" value={stats.totalShiftsToday} icon={<Clock size={20} />} color="blue" />
                    <StatCard label="Активных перерывов" value={stats.activeBreaks} icon={<Coffee size={20} />} color="amber" />
                    <StatCard label="Завершено сегодня" value={stats.completedBreaksToday} icon={<CheckCircle size={20} />} color="green" />
                    <StatCard label="Пропущено сегодня" value={stats.skippedBreaksToday} icon={<XCircle size={20} />} color="red" />
                    <StatCard label="Всего перерывов" value={stats.totalBreaksToday} icon={<BarChart3 size={20} />} color="indigo" />
                </div>
            )}

            <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Смены сегодня
                </h3>
                {shifts.length === 0 ? (
                    <p className="text-gray-500 text-sm">Нет активных смен</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-200">
                                    <th className="pb-3 font-medium">Сотрудник</th>
                                    <th className="pb-3 font-medium">Расписание</th>
                                    <th className="pb-3 font-medium">Группа</th>
                                    <th className="pb-3 font-medium">Перерывы</th>
                                    <th className="pb-3 font-medium">Статус</th>
                                    <th className="pb-3 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {shifts.map((s) => (
                                    <tr key={s.id}>
                                        <td className="py-3 font-medium text-gray-900">{s.userName}</td>
                                        <td className="py-3 text-gray-600">{s.scheduleName}</td>
                                        <td className="py-3">
                                            <Badge variant={s.group === "Day" ? "info" : "warning"}>
                                                {s.group === "Day" ? "День" : "Вечер"}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-gray-600">
                                            {s.completedBreaks}/{s.totalBreaks}
                                        </td>
                                        <td className="py-3">
                                            {s.activeBreaks > 0 ? (
                                                <Badge variant="warning">На перерыве</Badge>
                                            ) : (
                                                <Badge variant="success">Работает</Badge>
                                            )}
                                        </td>
                                        <td className="py-3">
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                icon={<Square size={12} />}
                                                onClick={() => handleEndShift(s.id)}
                                            >
                                                Завершить
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}

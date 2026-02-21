import { useEffect, useState } from "react";
import { adminApi } from "../../api/admin";
import type { Schedule, CreateScheduleDto } from "../../types";
import { ShiftType } from "../../types";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Plus, Trash2 } from "lucide-react";

export default function AdminSchedules() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        try { setSchedules(await adminApi.getSchedules()); }
        finally { setLoading(false); }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Удалить расписание?")) return;
        try {
            await adminApi.deleteSchedule(id);
            load();
        } catch (err: any) {
            alert(err.response?.data?.error ?? "Ошибка");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Расписания</h3>
                <Button
                    size="sm"
                    icon={<Plus size={14} />}
                    onClick={() => setShowCreate(!showCreate)}
                >
                    Создать
                </Button>
            </div>

            {showCreate && (
                <Card>
                    <CreateScheduleForm
                        onCreated={() => { setShowCreate(false); load(); }}
                        onCancel={() => setShowCreate(false)}
                    />
                </Card>
            )}

            <Card>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin h-6 w-6 border-4 border-indigo-600 border-t-transparent rounded-full" />
                    </div>
                ) : schedules.length === 0 ? (
                    <p className="text-gray-500 text-sm">Нет расписаний</p>
                ) : (
                    <div className="space-y-3">
                        {schedules.map((s) => (
                            <div
                                key={s.id}
                                className="flex items-center justify-between border border-gray-200 rounded-lg p-4"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">{s.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {s.startTime?.slice(0, 5)} — {s.endTime?.slice(0, 5)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={s.shiftType === "Day" ? "info" : "warning"}>
                                        {s.shiftType === "Day" ? "Дневная" : "Вечерняя"}
                                    </Badge>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        className="text-red-400 hover:text-red-600 p-1 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

function CreateScheduleForm({
    onCreated,
    onCancel,
}: {
    onCreated: () => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState<CreateScheduleDto>({
        name: "",
        startTime: "09:00:00",
        endTime: "18:00:00",
        shiftType: ShiftType.Day,
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminApi.createSchedule(form);
            onCreated();
        } catch (err: any) {
            alert(err.response?.data?.error ?? "Ошибка");
        } finally {
            setSaving(false);
        }
    };

    const inputCls =
        "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="font-semibold text-gray-900">Новое расписание</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                    <input
                        className={inputCls}
                        placeholder="Смена 09:00-18:00"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Тип смены</label>
                    <select
                        className={inputCls}
                        value={form.shiftType}
                        onChange={(e) => setForm({ ...form, shiftType: e.target.value as ShiftType })}
                    >
                        <option value="Day">Дневная</option>
                        <option value="Evening">Вечерняя</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Начало</label>
                    <input
                        type="time"
                        className={inputCls}
                        value={form.startTime.slice(0, 5)}
                        onChange={(e) => setForm({ ...form, startTime: e.target.value + ":00" })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Конец</label>
                    <input
                        type="time"
                        className={inputCls}
                        value={form.endTime.slice(0, 5)}
                        onChange={(e) => setForm({ ...form, endTime: e.target.value + ":00" })}
                        required
                    />
                </div>
            </div>
            <div className="flex gap-3">
                <Button type="submit" loading={saving}>Создать</Button>
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Отмена
                </Button>
            </div>
        </form>
    );
}

import { useEffect, useState } from "react";
import { adminApi } from "../../api/admin";
import type { BreakPoolDayDto, CreateBreakPoolDayDto } from "../../types";
import { ShiftType } from "../../types";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Plus } from "lucide-react";
import { todayISO } from "../../utils/date";

export default function AdminPools() {
    const [pools, setPools] = useState<BreakPoolDayDto[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        try { setPools(await adminApi.getBreakPools()); }
        finally { setLoading(false); }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                    Пулы перерывов
                </h3>
                <Button
                    size="sm"
                    icon={<Plus size={14} />}
                    onClick={() => setShowCreate(!showCreate)}
                >
                    Создать / Обновить
                </Button>
            </div>

            {showCreate && (
                <Card>
                    <CreatePoolForm
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
                ) : pools.length === 0 ? (
                    <p className="text-gray-500 text-sm">Нет пулов перерывов</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-200">
                                    <th className="pb-3 font-medium">Дата</th>
                                    <th className="pb-3 font-medium">Группа</th>
                                    <th className="pb-3 font-medium">Макс.</th>
                                    <th className="pb-3 font-medium">Занято</th>
                                    <th className="pb-3 font-medium">Свободно</th>
                                    <th className="pb-3 font-medium">Заполненность</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pools.map((p) => {
                                    const fillPct = p.maxCurrentBreaks > 0
                                        ? Math.round((p.currentBreaksCount / p.maxCurrentBreaks) * 100)
                                        : 0;
                                    return (
                                        <tr key={p.id}>
                                            <td className="py-3 font-medium text-gray-900">{p.workDate}</td>
                                            <td className="py-3">
                                                <Badge variant={p.group === "Day" ? "info" : "warning"}>
                                                    {p.group === "Day" ? "День" : "Вечер"}
                                                </Badge>
                                            </td>
                                            <td className="py-3 text-gray-600">{p.maxCurrentBreaks}</td>
                                            <td className="py-3 text-amber-600 font-medium">{p.currentBreaksCount}</td>
                                            <td className="py-3 text-emerald-600 font-medium">{p.availableBreaksCount}</td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-100 rounded-full h-2 w-24">
                                                        <div
                                                            className="bg-indigo-500 h-2 rounded-full transition-all"
                                                            style={{ width: `${fillPct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500">{fillPct}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}

function CreatePoolForm({
    onCreated,
    onCancel,
}: {
    onCreated: () => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState<CreateBreakPoolDayDto>({
        group: ShiftType.Day,
        workDate: todayISO(),
        maxCurrentBreaks: 5,
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminApi.createOrUpdateBreakPool(form);
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
            <h4 className="font-semibold text-gray-900">Пул перерывов</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
                    <input
                        type="date"
                        className={inputCls}
                        value={form.workDate}
                        onChange={(e) => setForm({ ...form, workDate: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Группа</label>
                    <select
                        className={inputCls}
                        value={form.group}
                        onChange={(e) => setForm({ ...form, group: e.target.value as ShiftType })}
                    >
                        <option value="Day">Дневная</option>
                        <option value="Evening">Вечерняя</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Макс. одновременных перерывов
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={20}
                        className={inputCls}
                        value={form.maxCurrentBreaks}
                        onChange={(e) =>
                            setForm({ ...form, maxCurrentBreaks: parseInt(e.target.value) || 1 })
                        }
                        required
                    />
                </div>
            </div>
            <div className="flex gap-3">
                <Button type="submit" loading={saving}>Сохранить</Button>
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Отмена
                </Button>
            </div>
        </form>
    );
}

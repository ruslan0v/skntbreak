import { useEffect, useState } from "react";
import { adminApi } from "../../api/admin";
import type { AdminUserDto, CreateUserAdminDto } from "../../types";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Plus, Trash2 } from "lucide-react";

export default function AdminUsers() {
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        try { setUsers(await adminApi.getUsers()); }
        finally { setLoading(false); }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Удалить пользователя?")) return;
        try {
            await adminApi.deleteUser(id);
            load();
        } catch (err: any) {
            alert(err.response?.data?.error ?? "Ошибка");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                    Пользователи
                </h3>
                <Button
                    size="sm"
                    icon={<Plus size={14} />}
                    onClick={() => setShowCreate(!showCreate)}
                >
                    Создать
                </Button>
            </div>

            {showCreate && (
                <CreateUserForm
                    onCreated={() => { setShowCreate(false); load(); }}
                    onCancel={() => setShowCreate(false)}
                />
            )}

            <Card>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin h-6 w-6 border-4 border-indigo-600 border-t-transparent rounded-full" />
                    </div>
                ) : users.length === 0 ? (
                    <p className="text-gray-500 text-sm">Нет пользователей</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-200">
                                    <th className="pb-3 font-medium">ID</th>
                                    <th className="pb-3 font-medium">Имя</th>
                                    <th className="pb-3 font-medium">Логин</th>
                                    <th className="pb-3 font-medium">Роль</th>
                                    <th className="pb-3 font-medium">Смены</th>
                                    <th className="pb-3 font-medium">Перерывы</th>
                                    <th className="pb-3 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td className="py-3 text-gray-400">{u.id}</td>
                                        <td className="py-3 font-medium text-gray-900">{u.userName}</td>
                                        <td className="py-3 text-gray-500">{u.login}</td>
                                        <td className="py-3">
                                            <Badge
                                                variant={
                                                    u.role === "Admin" ? "danger" :
                                                        u.role === "TeamLead" ? "warning" :
                                                            "default"
                                                }
                                            >
                                                {u.role}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-gray-600">{u.totalShifts}</td>
                                        <td className="py-3 text-gray-600">
                                            {u.completedBreaks}/{u.totalBreaks}
                                        </td>
                                        <td className="py-3">
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="text-red-400 hover:text-red-600 p-1 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
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

function CreateUserForm({
    onCreated,
    onCancel,
}: {
    onCreated: () => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState<CreateUserAdminDto>({
        userName: "",
        login: "",
        password: "",
        role: "Chatter",
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminApi.createUser(form);
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
        <Card>
            <h4 className="font-semibold text-gray-900 mb-4">Новый пользователь</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                        <input
                            className={inputCls}
                            placeholder="Иванов Иван"
                            value={form.userName}
                            onChange={(e) => setForm({ ...form, userName: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
                        <input
                            className={inputCls}
                            placeholder="ivanov"
                            value={form.login}
                            onChange={(e) => setForm({ ...form, login: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                        <input
                            type="password"
                            className={inputCls}
                            placeholder="Минимум 6 символов"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                        <select
                            className={inputCls}
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="SL1">SL1</option>
                            <option value="SL2">SL2</option>
                            <option value="Chatter">Chatter</option>
                            <option value="TeamLead">TeamLead</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button type="submit" loading={saving}>Создать</Button>
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Отмена
                    </Button>
                </div>
            </form>
        </Card>
    );
}

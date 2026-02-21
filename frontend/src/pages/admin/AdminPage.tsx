import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { BarChart3, Users, Calendar, Layers } from "lucide-react";
import clsx from "clsx";

const tab =
    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors";

export default function AdminPage() {
    const { isAdmin, isTeamLead } = useAuth();

    if (!isAdmin && !isTeamLead) return <Navigate to="/dashboard" replace />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Админ-панель</h1>
                <p className="text-gray-500 mt-1">Управление системой</p>
            </div>

            <nav className="flex gap-2 flex-wrap border-b border-gray-200 pb-2">
                {[
                    { to: "overview", label: "Обзор", icon: <BarChart3 size={16} /> },
                    { to: "users", label: "Пользователи", icon: <Users size={16} /> },
                    { to: "schedules", label: "Расписания", icon: <Calendar size={16} /> },
                    { to: "pools", label: "Пулы перерывов", icon: <Layers size={16} /> },
                ].map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            clsx(
                                tab,
                                isActive
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            )
                        }
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <Outlet />
        </div>
    );
}

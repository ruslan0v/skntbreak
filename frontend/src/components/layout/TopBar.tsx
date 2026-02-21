import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut, Shield } from "lucide-react";

export default function TopBar() {
  const { user, isAdmin, isTeamLead, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <a href="/dashboard" className="text-lg font-bold text-gray-900">Skntbreak</a>
          <nav className="flex gap-1">
            {[
              { to: "/dashboard", label: "Dashboard" },
              { to: "/shifts", label: "Shifts" },
              { to: "/profile", label: "Profile" },
            ].map((l) => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                    isActive ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"
                  }`
                }>{l.label}</NavLink>
            ))}
            {(isAdmin || isTeamLead) && (
              <NavLink to="/admin"
                className={({ isActive }) =>
                  `px-3 py-1.5 text-sm font-medium rounded-lg transition flex items-center gap-1 ${
                    isActive ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"
                  }`
                }><Shield size={14} /> Admin</NavLink>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900">{user?.userName}</span>
          <span className="text-xs font-semibold text-green-600">{user?.role}</span>
          <button onClick={() => { logout(); navigate("/login"); }}
            className="text-gray-400 hover:text-red-500 p-1 transition">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

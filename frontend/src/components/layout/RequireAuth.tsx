import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import TopBar from "./TopBar";

export default function RequireAuth() {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace />;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const showTopBar = location.pathname !== "/dashboard";

  return (
    <div className="min-h-screen">
      {showTopBar && <TopBar />}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}

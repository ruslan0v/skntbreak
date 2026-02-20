import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { Header } from './components/Header';
//import { Sidebar } from './components/Sidebar';
import './app.css';

function hasToken(): boolean {
    return Boolean(localStorage.getItem('token'));
}

function RequireAuth() {
    if (!hasToken()) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
}

function AppShell() {
    return (
        <div className="app">
            {/*<Sidebar />*/}
            <div className="app__main">
                <Header />
                <main className="app__content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes */}
                <Route element={<RequireAuth />}>
                    <Route element={<AppShell />}>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/admin" element={<AdminPage />} />
                    </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

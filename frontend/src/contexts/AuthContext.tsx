import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { authApi } from "../api/auth";
import type { UserProfileDto } from "../types";

interface AuthCtx {
    user: UserProfileDto | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    refreshProfile: () => Promise<void>;
    isAdmin: boolean;
    isTeamLead: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem("token")
    );
    const [user, setUser] = useState<UserProfileDto | null>(null);

    const login = (t: string) => {
        localStorage.setItem("token", t);
        setToken(t);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const refreshProfile = async () => {
        try {
            const profile = await authApi.getProfile();
            setUser(profile);
        } catch {
            logout();
        }
    };

    useEffect(() => {
        if (token) refreshProfile();
    }, [token]);

    const isAdmin = user?.role === "Admin";
    const isTeamLead = user?.role === "TeamLead" || isAdmin;

    return (
        <AuthContext.Provider
      value= {{ user, token, login, logout, refreshProfile, isAdmin, isTeamLead }
}
    >
    { children }
    </AuthContext.Provider>
  );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be inside AuthProvider");
    return ctx;
}

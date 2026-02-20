export interface User {
  id: number;
  userName: string;
  login: string;
  role: 'User' | 'TeamLead' | 'Admin';
}

export interface AuthResponse {
  token: string;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  login: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (login: string, password: string) => Promise<void>;
  register: (userName: string, login: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}
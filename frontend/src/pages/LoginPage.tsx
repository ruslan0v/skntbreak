import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authApi } from "../api/auth";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { token } = await authApi.login({ login, password });
      auth.login(token);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error ?? "Auth error");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-10">Skntbreak</h1>
        <form onSubmit={submit} className="space-y-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <input type="text" value={login} onChange={e => setLogin(e.target.value)}
            required autoFocus placeholder="Login"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:border-gray-900 focus:ring-0 outline-none transition" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            required placeholder="Password"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:border-gray-900 focus:ring-0 outline-none transition" />
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition disabled:opacity-50">
            {loading ? "..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

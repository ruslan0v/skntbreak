import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authApi } from "../api/auth";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.userName ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile({ userName: name });
      await refreshProfile();
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e: any) { alert(e.response?.data?.error ?? "Error"); }
    finally { setSaving(false); }
  };

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600">
            {user.userName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{user.userName}</p>
            <span className="text-xs font-bold text-green-600">{user.role}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1.5">Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-gray-900 outline-none transition" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1.5">Login</label>
          <input value={user.login} disabled
            className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-not-allowed" />
        </div>
        <button onClick={save} disabled={saving}
          className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-50">
          {saved ? "Saved!" : saving ? "..." : "Save"}
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { l: "Shifts", v: user.totalShifts },
            { l: "Breaks", v: user.totalBreaks },
            { l: "Completed", v: user.completedBreaks },
            { l: "Skipped", v: user.skippedBreaks },
          ].map(s => (
            <div key={s.l} className="text-center py-3 rounded-xl bg-gray-50">
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{s.v}</p>
              <p className="text-xs text-gray-400 mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

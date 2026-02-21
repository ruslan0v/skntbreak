import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { shiftsApi } from "../api/shifts";
import { breaksApi } from "../api/breaks";
import { queueApi } from "../api/queue";
import type {
  UserShiftDto, BreakPoolInfoDto, QueueStateDto,
  QueueEntryDto, ColleagueDto, ActiveBreakDto,
} from "../types";
import { QueueStatus } from "../types";
import { todayISO } from "../utils/date";
import { useQueueHub } from "../hooks/useQueueHub";
import { useCountdown } from "../hooks/useCountdown";
import { Flame, SkipForward, Zap, LogOut, Shield, Settings } from "lucide-react";

function elapsedStr(start: string): string {
  const d = Math.max(0, Math.floor((Date.now() - new Date(start).getTime()) / 1000));
  const h = Math.floor(d / 3600), m = Math.floor((d % 3600) / 60), s = d % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function remainStr(start: string, dur: number): string {
  const end = new Date(start).getTime() + dur * 60_000;
  const d = Math.max(0, Math.floor((end - Date.now()) / 1000));
  const m = Math.floor(d / 60), s = d % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export default function DashboardPage() {
  const { user, isAdmin, isTeamLead, logout } = useAuth();
  const navigate = useNavigate();
  const today = todayISO();

  const [shift, setShift] = useState<UserShiftDto | null>(null);
  const [pool, setPool] = useState<BreakPoolInfoDto | null>(null);
  const [queue, setQueue] = useState<QueueStateDto | null>(null);
  const [colleagues, setColleagues] = useState<ColleagueDto[]>([]);
  const [activeBreak, setActiveBreak] = useState<ActiveBreakDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const load = useCallback(async () => {
    try {
      const [s, p, q, ab] = await Promise.allSettled([
        shiftsApi.getMyShift(today),
        breaksApi.getPoolInfo(today),
        queueApi.getState(),
        breaksApi.getMyActive(),
      ]);
      const sd = s.status === "fulfilled" ? s.value : null;
      setShift(sd);
      if (p.status === "fulfilled") setPool(p.value);
      if (q.status === "fulfilled") setQueue(q.value);
      if (ab.status === "fulfilled" && ab.value.hasActiveBreak && ab.value.breakData)
        setActiveBreak(ab.value.breakData);
      else setActiveBreak(null);
      if (sd?.scheduleId) {
        try {
          setColleagues(await shiftsApi.getColleagues(sd.scheduleId, sd.workDate));
        } catch { setColleagues([]); }
      }
    } finally { setLoading(false); }
  }, [today]);

  useEffect(() => { load(); }, [load]);

  useQueueHub({
    onQueueUpdated: (q, slots, round) =>
      setQueue(prev => prev ? { ...prev, queue: q, availableSlots: slots, currentRound: round } : prev),
    onYourTurn: () => load(),
    onNotificationExpired: () => load(),
    onBreakEnded: () => load(),
  });

  const act = async (fn: () => Promise<any>) => {
    setActionLoading(true);
    try { await fn(); await load(); }
    catch (e: any) { alert(e.response?.data?.error ?? "Error"); }
    finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!shift) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 text-lg mb-4">No active shift</p>
        <button onClick={() => navigate("/shifts")}
          className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition">
          Start shift
        </button>
      </div>
    </div>
  );

  const now = new Date();
  const myEntry = queue?.myEntry;
  const isNotified = myEntry?.status === QueueStatus.Notified;
  const isInQueue = myEntry?.status === QueueStatus.Waiting || isNotified;
  const visible = queue?.queue?.filter(
    q => q.status === QueueStatus.Waiting || q.status === QueueStatus.Notified
  ) ?? [];
  const done = shift.breaks?.filter(b => b.status === "Finished" || b.status === "Skipped").length ?? 0;
  const total = shift.breaks?.length ?? 2;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* TOP: day/time + user */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">{DAYS[now.getDay()]}</h1>
          <p className="text-3xl font-bold text-green-500 tabular-nums mt-1">
            {now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-base font-semibold text-gray-900">{user?.userName}</p>
            <p className="text-xs font-semibold text-green-600">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
            {user?.userName?.[0]?.toUpperCase()}
          </div>
          <div className="flex gap-1 ml-2">
            {(isAdmin || isTeamLead) && (
              <button onClick={() => navigate("/admin")} title="Admin"
                className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition">
                <Shield size={16} />
              </button>
            )}
            <button onClick={() => navigate("/profile")} title="Profile"
              className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition">
              <Settings size={16} />
            </button>
            <button onClick={() => { logout(); navigate("/login"); }} title="Logout"
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* NOTIFICATION */}
      {isNotified && myEntry && (
        <NotifBanner entry={myEntry} loading={actionLoading}
          onConfirm={() => act(() => queueApi.confirm(myEntry.id))}
          onPostpone={() => act(() => queueApi.postpone(myEntry.id))} />
      )}

      {/* 2-COL */}
      <div className="flex gap-8 items-start">
        {/* LEFT: queue */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 mb-5">(You) {user?.userName}</h2>

          <div className="grid grid-cols-[40px_1fr_100px_80px_140px] gap-x-2 text-sm text-gray-400 font-medium mb-2 px-1">
            <span></span><span>Name</span><span>Status</span><span>Breaks</span><span>Timer</span>
          </div>

          <div>
            {visible.map((entry) => {
              const isMe = entry.id === myEntry?.id;
              const taking = entry.status === QueueStatus.Notified;
              return (
                <div key={entry.id}
                  className="grid grid-cols-[40px_1fr_100px_80px_140px] gap-x-2 items-center py-3.5 px-1 border-b border-gray-50">
                  <span className="text-gray-300">
                    {entry.isPriority ? <Zap size={16} className="text-amber-400" /> : <Flame size={16} />}
                  </span>
                  <span className="text-gray-900 font-medium truncate">{entry.userName}</span>
                  <span className={`font-semibold text-sm ${taking ? "text-red-500" : "text-green-500"}`}>
                    {taking ? "Break" : "In line"}
                  </span>
                  <span className="text-gray-500 tabular-nums text-sm">{done}/{total}</span>
                  <span className="text-gray-900 tabular-nums text-sm font-medium">
                    {elapsedStr(entry.enqueuedAt)}
                    {entry.durationMinutes > 0 && <span className="text-gray-400 ml-1">({entry.durationMinutes})</span>}
                  </span>
                </div>
              );
            })}
            {visible.length === 0 && (
              <div className="py-12 text-center text-gray-300 text-sm">Queue is empty</div>
            )}
          </div>

          {!isInQueue && !activeBreak && (
            <div className="mt-6 flex flex-wrap gap-2">
              {queue?.allowDurationChoice ? (<>
                <button onClick={() => act(() => queueApi.enqueue({ durationMinutes: 10 }))}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-green-500 text-white font-semibold text-sm rounded-xl hover:bg-green-600 transition disabled:opacity-50">
                  Join queue (10 min)
                </button>
                <button onClick={() => act(() => queueApi.enqueue({ durationMinutes: 20 }))}
                  disabled={actionLoading}
                  className="px-5 py-2.5 border-2 border-green-500 text-green-600 font-semibold text-sm rounded-xl hover:bg-green-50 transition disabled:opacity-50">
                  Join queue (20 min)
                </button>
              </>) : (
                <button onClick={() => act(() => queueApi.enqueue())}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-green-500 text-white font-semibold text-sm rounded-xl hover:bg-green-600 transition disabled:opacity-50">
                  Join queue
                </button>
              )}
              <button onClick={() => act(() => queueApi.skipRound())}
                disabled={actionLoading}
                className="px-4 py-2.5 text-gray-400 text-sm font-medium rounded-xl hover:bg-gray-50 transition disabled:opacity-50 flex items-center gap-1.5">
                <SkipForward size={14} /> Skip round
              </button>
            </div>
          )}

          {isInQueue && !isNotified && (
            <div className="mt-4 text-center bg-green-50 rounded-2xl py-3">
              <p className="text-green-600 font-semibold text-sm">You are in queue — position #{myEntry?.position}</p>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="w-72 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-bold text-gray-900 text-lg">Shift</h3>
              <span className="text-sm text-gray-500 font-medium">
                {shift.schedule?.startTime?.slice(0,5)}-{shift.schedule?.endTime?.slice(0,5)}
              </span>
            </div>
            <p className="text-sm text-gray-500">Breaks left: {total - done}</p>
          </div>

          {activeBreak ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className="text-5xl mb-2">{"\u{1F36A}"}</div>
              <p className="text-4xl font-bold tabular-nums text-gray-900 mb-4">
                {remainStr(activeBreak.startTime, activeBreak.durationMinutes)}
              </p>
              <button onClick={() => act(() => breaksApi.endBreak(activeBreak.id).then(() => setActiveBreak(null)))}
                className="w-full py-3 bg-green-500 text-white font-bold text-base rounded-2xl hover:bg-green-600 transition">
                End break
              </button>
              <p className="text-xs text-gray-400 mt-3">Free slots: {pool?.availableBreaks ?? 0}</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className="text-5xl mb-2 opacity-30">{"\u{1F36A}"}</div>
              <p className="text-sm text-gray-300">No active break</p>
              <p className="text-xs text-gray-300 mt-1">Free slots: {pool?.availableBreaks ?? 0}</p>
            </div>
          )}

          {colleagues.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Today on shift</h3>
              <div className="space-y-2.5">
                {colleagues.map((c) => (
                  <div key={c.userId} className="flex items-center justify-between">
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-lg text-white ${
                      c.isCurrentUser ? "bg-green-500" : "bg-green-400"
                    }`}>{c.userName}</span>
                    <span className="text-sm text-gray-400 tabular-nums">
                      {shift.schedule?.startTime?.slice(0,5)}-{shift.schedule?.endTime?.slice(0,5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotifBanner({ entry, onConfirm, onPostpone, loading }: {
  entry: QueueEntryDto; onConfirm: () => void; onPostpone: () => void; loading: boolean;
}) {
  const expires = entry.notifiedAt ? new Date(new Date(entry.notifiedAt).getTime() + 90_000) : null;
  const { display } = useCountdown(expires);
  return (
    <div className="mb-6 bg-white rounded-2xl border-2 border-green-400 p-5 animate-pulse-soft">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{"\u{1F36A}"}</span>
        <div>
          <p className="font-bold text-gray-900 text-lg">Your turn!</p>
          <p className="text-red-500 font-bold tabular-nums">{display} left</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition disabled:opacity-50">
          Confirm
        </button>
        <button onClick={onPostpone} disabled={loading}
          className="flex-1 py-3 bg-white text-gray-600 font-semibold border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition disabled:opacity-50">
          Postpone
        </button>
      </div>
    </div>
  );
}

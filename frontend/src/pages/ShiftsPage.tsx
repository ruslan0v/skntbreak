import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { shiftsApi } from "../api/shifts";
import type { Schedule, UserShiftDto } from "../types";
import { todayISO } from "../utils/date";

export default function ShiftsPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [myShift, setMyShift] = useState<UserShiftDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [a, s] = await Promise.allSettled([
        shiftsApi.getAvailable(), shiftsApi.getMyShift(todayISO()),
      ]);
      if (a.status === "fulfilled") setSchedules(a.value);
      if (s.status === "fulfilled") setMyShift(s.value); else setMyShift(null);
    } finally { setLoading(false); }
  }

  const start = async (id: number) => {
    setStarting(true);
    try { await shiftsApi.startShift({ scheduleId: id }); navigate("/dashboard"); }
    catch (e: any) { alert(e.response?.data?.error ?? "Error"); }
    finally { setStarting(false); }
  };

  const end = async () => {
    if (!confirm("End shift?")) return;
    setEnding(true);
    try { await shiftsApi.endShift(); setMyShift(null); }
    catch (e: any) { alert(e.response?.data?.error ?? "Error"); }
    finally { setEnding(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shifts</h1>
      {myShift ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Active shift</h3>
            <span className="px-3 py-1 rounded-lg bg-green-100 text-green-600 text-xs font-bold">Active</span>
          </div>
          <div className="space-y-2 text-sm text-gray-500 mb-6">
            <div className="flex justify-between"><span>Schedule</span><span className="text-gray-900 font-medium">{myShift.schedule?.name}</span></div>
            <div className="flex justify-between"><span>Time</span><span className="text-gray-900 font-medium">{myShift.schedule?.startTime?.slice(0,5)} - {myShift.schedule?.endTime?.slice(0,5)}</span></div>
            <div className="flex justify-between"><span>Breaks</span><span className="text-gray-900 font-medium">{myShift.breaks?.filter(b=>b.status==="Finished").length??0}/{myShift.breaks?.length??0}</span></div>
          </div>
          <button onClick={end} disabled={ending}
            className="w-full py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition disabled:opacity-50">
            {ending ? "..." : "End shift"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{s.name}</p>
                <p className="text-sm text-gray-400">{s.startTime?.slice(0,5)} - {s.endTime?.slice(0,5)}
                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500">{s.shiftType}</span>
                </p>
              </div>
              <button onClick={() => start(s.id)} disabled={starting}
                className="px-5 py-2 bg-gray-900 text-white font-semibold text-sm rounded-xl hover:bg-gray-800 transition disabled:opacity-50">
                Start
              </button>
            </div>
          ))}
          {schedules.length === 0 && <p className="text-gray-300 text-center py-12">No schedules</p>}
        </div>
      )}
    </div>
  );
}

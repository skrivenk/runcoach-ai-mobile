"use client";
import { useState } from "react";
import { api } from "@/lib/api";

function isoDate(d: Date) { return d.toISOString().slice(0,10); }
function currentWeekRange() {
  const today = new Date();
  const mondayOffset = ((today.getDay() + 6) % 7); // 0=Mon
  const start = new Date(today);
  start.setDate(today.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: isoDate(start), end: isoDate(end) };
}

export default function AIRecalcPreview({ planId }: { planId: string }) {
  const [{ start, end }] = useState(currentWeekRange());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setLoading(true); setErr(null);
    try {
      const res = await api.post(`/ai/recalc/${planId}`, null, { params: { start_date: start, end_date: end }});
      setData(res.data);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to get suggestions");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded border bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-neutral-700">Preview suggestions for {start} → {end}</div>
        <button className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
                onClick={run} disabled={loading}>
          {loading ? "Running…" : "AI Recalc Preview"}
        </button>
      </div>
      {err && <div className="text-sm text-red-600">{err}</div>}
      {data && (
        <div className="space-y-2">
          {(data.suggestions ?? []).map((s: any, i: number)=>(
            <div key={i} className="rounded border p-2 text-sm">
              <div className="font-medium">{s.date} — {s.type ?? s.workout_type ?? "workout"}</div>
              {s.mi && <div>Distance: {s.mi} mi</div>}
              {s.pace && <div>Pace: {s.pace}</div>}
              {s.notes && <div className="text-neutral-700">{s.notes}</div>}
            </div>
          ))}
          {(!data.suggestions || data.suggestions.length===0) && (
            <div className="text-sm text-neutral-600">No suggestions.</div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function CreatePlanForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("Base Build");
  const [goalType, setGoalType] = useState("5k");
  const [startDate, setStartDate] = useState("2025-11-10");
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [maxDays, setMaxDays] = useState(5);
  const [longRunDay, setLongRunDay] = useState("Sunday");
  const [weeklyCap, setWeeklyCap] = useState(0.1);
  const [longCap, setLongCap] = useState(0.3);
  const [guardrails, setGuardrails] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setErr(null);
    setBusy(true);
    try {
      await api.post("/plans", {
        name,
        goal_type: goalType,
        start_date: startDate,
        race_date: null,
        duration_weeks: durationWeeks,
        max_days_per_week: maxDays,
        long_run_day: longRunDay,
        weekly_increase_cap: weeklyCap,
        long_run_cap: longCap,
        guardrails_enabled: guardrails,
      });
      onCreated();
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to create plan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={(e)=>{ e.preventDefault(); submit(); }}>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">Name
          <input className="mt-1 w-full rounded border p-2" value={name} onChange={(e)=>setName(e.target.value)} />
        </label>
        <label className="text-sm">Goal
          <input className="mt-1 w-full rounded border p-2" value={goalType} onChange={(e)=>setGoalType(e.target.value)} />
        </label>
        <label className="text-sm">Start Date
          <input className="mt-1 w-full rounded border p-2" type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
        </label>
        <label className="text-sm">Duration (weeks)
          <input className="mt-1 w-full rounded border p-2" type="number" min={1} value={durationWeeks} onChange={(e)=>setDurationWeeks(parseInt(e.target.value||"0"))} />
        </label>
        <label className="text-sm">Max days/week
          <input className="mt-1 w-full rounded border p-2" type="number" min={1} max={7} value={maxDays} onChange={(e)=>setMaxDays(parseInt(e.target.value||"0"))} />
        </label>
        <label className="text-sm">Long run day
          <select className="mt-1 w-full rounded border p-2" value={longRunDay} onChange={(e)=>setLongRunDay(e.target.value)}>
            {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d=>(
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">Weekly increase cap
          <input className="mt-1 w-full rounded border p-2" type="number" step="0.01" value={weeklyCap} onChange={(e)=>setWeeklyCap(parseFloat(e.target.value||"0"))} />
        </label>
        <label className="text-sm">Long run cap
          <input className="mt-1 w-full rounded border p-2" type="number" step="0.01" value={longCap} onChange={(e)=>setLongCap(parseFloat(e.target.value||"0"))} />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={guardrails} onChange={(e)=>setGuardrails(e.target.checked)} />
        Guardrails enabled
      </label>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="rounded bg-neutral-200 px-3 py-2" onClick={onCancel} disabled={busy}>Cancel</button>
        <button type="submit" className="rounded bg-black px-3 py-2 text-white" disabled={busy}>
          {busy ? "Creating…" : "Create Plan"}
        </button>
      </div>
    </form>
  );
}

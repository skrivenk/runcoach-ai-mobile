"use client";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MonthGrid } from "@/components/month-grid";
import AIRecalcPreview from "@/components/ai-recalc-preview";

function fmt(d: Date){ return d.toISOString().slice(0,10); }

export default function CalendarPage() {
  const sp = useSearchParams();
  const planId = sp.get("plan");
  const today = new Date();
  const [year, month] = [today.getFullYear(), today.getMonth()+1];

  const range = useMemo(()=>{
    const start = new Date(year, month-1, 1);
    const end = new Date(year, month, 0);
    return { start: fmt(start), end: fmt(end) };
  }, [year, month]);

  const { data } = useQuery({
    queryKey: ["workouts", planId, range.start, range.end],
    queryFn: async () => {
      if (!planId) return [];
      const res = await api.get(`/workouts/${planId}/range`, { params: range });
      return res.data;
    },
    enabled: !!planId,
  });

  const byDate = useMemo(()=>{
    const m = new Map<string, any[]>();
    (data ?? []).forEach((w:any)=>{
      if (!m.has(w.date)) m.set(w.date, []);
      m.get(w.date)!.push(w);
    });
    return m;
  }, [data]);

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Calendar</h1>

      {planId && <AIRecalcPreview planId={planId} />}

      <MonthGrid year={year} month={month} renderCell={(d)=>{
        const ws = byDate.get(fmt(d)) || [];
        return ws.slice(0,2).map((w:any, i:number)=>(
          <div key={i} className="truncate">{w.workout_type} {w.planned_distance ?? ""}</div>
        ));
      }}/>
    </main>
  );
}

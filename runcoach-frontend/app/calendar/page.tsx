"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MonthGrid } from "@/components/month-grid";
import AIRecalcPreview from "@/components/ai-recalc-preview";

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const planId = sp.get("plan");
  const today = new Date();
  const [year, month] = [today.getFullYear(), today.getMonth() + 1];
  const queryClient = useQueryClient();

  const range = useMemo(() => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return { start: fmt(start), end: fmt(end) };
  }, [year, month]);

  const { data } = useQuery({
    queryKey: ["workouts", planId, range.start, range.end],
    queryFn: async () => {
      if (!planId) return [];
      const res = await api.get(`/workouts/${planId}/range`, {
        params: { start: range.start, end: range.end },
      });
      return res.data;
    },
    enabled: !!planId,
  });

  const byDate = useMemo(() => {
    const m = new Map<string, any[]>();
    (data ?? []).forEach((w: any) => {
      if (!m.has(w.date)) m.set(w.date, []);
      m.get(w.date)!.push(w);
    });
    return m;
  }, [data]);

  function handleApplied() {
    if (!planId) return;
    queryClient.invalidateQueries({
      queryKey: ["workouts", planId, range.start, range.end],
    });
  }

  if (!planId) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="mb-2 text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-neutral-700">
          No plan selected. Open a plan from the{" "}
          <button
            className="underline"
            onClick={() => router.push("/plans")}
          >
            Plans
          </button>{" "}
          page.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6">
      <header className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-xs text-neutral-600">
            Plan ID: {planId} · Month view
          </p>
        </div>
        <button
          className="rounded bg-black px-3 py-1 text-xs font-medium text-white"
          onClick={() => router.push(`/week?plan=${planId}`)}
        >
          This Week
        </button>
      </header>

      <AIRecalcPreview planId={planId} onApplied={handleApplied} />

      <MonthGrid
        year={year}
        month={month}
        renderCell={(d) => {
          const ws = byDate.get(fmt(d)) || [];
          return ws.slice(0, 2).map((w: any, i: number) => (
            <div key={i} className="truncate text-xs">
              {w.workout_type}{" "}
              {w.planned_distance != null ? `${w.planned_distance} mi` : ""}
            </div>
          ));
        }}
      />
    </main>
  );
}

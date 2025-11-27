"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import WorkoutDrawer, { Workout } from "@/components/workout-drawer";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function currentWeekRange() {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7; // 0 = Monday
  const start = new Date(today);
  start.setDate(today.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function formatPretty(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function WeekPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get("plan");

  const { start: startDateObj, end: endDateObj } = useMemo(
    () => currentWeekRange(),
    []
  );

  const start = isoDate(startDateObj);
  const end = isoDate(endDateObj);

  const queryClient = useQueryClient();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [marking, setMarking] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["week", planId, start, end],
    queryFn: async () => {
      if (!planId) return [];
      const res = await api.get(`/workouts/${planId}/range`, {
        params: { start, end },
      });
      return res.data as Workout[];
    },
    enabled: !!planId,
  });

  const workouts = useMemo(() => {
    const items = (data ?? []).slice().sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    return items;
  }, [data]);

  async function handleMarkComplete(w: Workout) {
    try {
      setMarking(true);
      await api.post(`/workouts/${w.id}/complete`, {
        // Minimal body; backend treats all fields as optional.
        actual_distance: w.actual_distance ?? w.planned_distance ?? null,
      });
      // Refresh this week
      await queryClient.invalidateQueries({
        queryKey: ["week", planId, start, end],
      });
      setSelectedWorkout(null);
    } catch (err) {
      console.error("Failed to mark complete", err);
    } finally {
      setMarking(false);
    }
  }

  if (!planId) {
    return (
      <main className="mx-auto max-w-lg p-4">
        <h1 className="mb-2 text-xl font-semibold">This Week</h1>
        <p className="mb-4 text-sm text-neutral-700">
          No plan selected. Open a plan from the{" "}
          <button
            className="underline"
            onClick={() => router.push("/plans")}
          >
            Plans
          </button>{" "}
          page and use the This Week button (or add <code>?plan=ID</code> to
          the URL).
        </p>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-lg p-4">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">This Week</h1>
            <div className="text-xs text-neutral-600">
              {formatPretty(startDateObj)} – {formatPretty(endDateObj)}
            </div>
          </div>
          <button
            className="rounded bg-black px-3 py-1 text-xs font-medium text-white"
            onClick={() => router.push(`/calendar?plan=${planId}`)}
          >
            Calendar
          </button>
        </header>

        {isLoading && (
          <div className="text-sm text-neutral-700">Loading workouts…</div>
        )}

        {error && (
          <div className="text-sm text-red-600">
            Failed to load week. Check backend / auth.
          </div>
        )}

        {!isLoading && !error && workouts.length === 0 && (
          <div className="text-sm text-neutral-700">
            No workouts scheduled for this week.
          </div>
        )}

        <div className="mt-2 space-y-3">
          {workouts.map((w) => {
            const dateObj = new Date(w.date);
            const dayLabel = dateObj.toLocaleDateString(undefined, {
              weekday: "short",
            });
            const dateLabel = dateObj.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });

            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWorkout(w)}
                className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-left shadow-sm"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase text-neutral-500">
                    {dayLabel} · {dateLabel}
                  </div>
                  {w.completed && (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      Done
                    </span>
                  )}
                </div>
                <div className="mb-1 text-sm font-medium">
                  {w.workout_type || "Run"}
                  {w.planned_distance != null
                    ? ` · ${w.planned_distance} mi`
                    : ""}
                </div>
                {w.description && (
                  <div className="mb-1 text-xs text-neutral-700">
                    {w.description}
                  </div>
                )}
                {w.notes && (
                  <div className="mb-1 text-xs text-neutral-600">
                    Notes: {w.notes}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </main>

      <WorkoutDrawer
        workout={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        onMarkComplete={handleMarkComplete}
        isCompleting={marking}
      />
    </>
  );
}

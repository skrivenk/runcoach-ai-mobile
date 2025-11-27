"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Plan = {
  id: number;
  name: string;
  goal_race_date?: string | null;
  goal_race_name?: string | null;
  created_at?: string | null;
};

export default function PlansPage() {
  const router = useRouter();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await api.get("/plans");
      return res.data;
    },
  });

  // If we ever get a 401 here, bounce to login
  useEffect(() => {
    if (!error) return;
    const anyErr = error as any;
    const status = anyErr?.response?.status;
    if (status === 401) {
      router.push("/login");
    }
  }, [error, router]);

  const plans = data ?? [];

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your Plans</h1>
          <p className="text-sm text-neutral-600">
            Select a plan to view its calendar or this week&apos;s schedule.
          </p>
        </div>
        <button
          type="button"
          className="rounded bg-black px-3 py-1 text-sm text-white"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {isLoading && (
        <div className="text-sm text-neutral-700">Loading plans…</div>
      )}

      {error && (
        <div className="text-sm text-red-600">
          Failed to load plans. Check login / backend.
        </div>
      )}

      {!isLoading && !error && plans.length === 0 && (
        <div className="text-sm text-neutral-700">
          You don&apos;t have any plans yet. Create one using the app or future
          wizard.
        </div>
      )}

      <div className="mt-4 space-y-4">
        {plans.map((p) => {
          const raceDate = p.goal_race_date
            ? new Date(p.goal_race_date).toLocaleDateString()
            : null;
          const created = p.created_at
            ? new Date(p.created_at).toLocaleDateString()
            : null;

          return (
            <div
              key={p.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-base font-semibold">{p.name}</h2>
                {raceDate && (
                  <span className="text-xs text-neutral-500">
                    Race: {raceDate}
                  </span>
                )}
              </div>
              {p.goal_race_name && (
                <div className="mb-1 text-xs text-neutral-700">
                  Goal race: {p.goal_race_name}
                </div>
              )}
              {created && (
                <div className="mb-3 text-xs text-neutral-500">
                  Created: {created}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded bg-neutral-900 px-3 py-1 text-xs font-medium text-white"
                  onClick={() => router.push(`/calendar?plan=${p.id}`)}
                >
                  Calendar
                </button>
                <button
                  type="button"
                  className="rounded border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-800"
                  onClick={() => router.push(`/week?plan=${p.id}`)}
                >
                  This Week
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

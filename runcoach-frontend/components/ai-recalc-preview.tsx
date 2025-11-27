"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Modal from "@/components/modal";

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
  return { start: isoDate(start), end: isoDate(end) };
}

type Suggestion = {
  date: string;
  workout_type?: string | null;
  type?: string | null; // in case AI uses "type"
  mi?: number | null;
  pace?: string | null;
  notes?: string | null;
  description?: string | null;
};

type RecalcResponse = {
  suggestions?: Suggestion[];
  [key: string]: any;
};

export default function AIRecalcPreview({
  planId,
  onApplied,
}: {
  planId: string;
  onApplied?: () => void;
}) {
  const [{ start, end }] = useState(currentWeekRange());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RecalcResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applyBusy, setApplyBusy] = useState(false);
  const [applyErr, setApplyErr] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setErr(null);
    setApplyResult(null);
    try {
      const res = await api.post(`/ai/recalc/${planId}`, null, {
        params: { start_date: start, end_date: end },
      });
      setData(res.data);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to get suggestions");
    } finally {
      setLoading(false);
    }
  }

  const suggestions: Suggestion[] = (data?.suggestions ?? []).map((s) => ({
    ...s,
    workout_type: s.workout_type ?? s.type ?? "run",
  }));

  async function applyChanges() {
    if (!suggestions.length) return;
    setApplyBusy(true);
    setApplyErr(null);
    setApplyResult(null);
    try {
      const res = await api.post(`/workouts/apply/${planId}`, {
        suggestions: suggestions.map((s) => ({
          date: s.date,
          workout_type: s.workout_type,
          mi: s.mi,
          pace: s.pace,
          notes: s.notes,
          description: s.description,
        })),
      });

      setApplyResult(
        `Created ${res.data.created}, updated ${res.data.updated}`
      );
      setConfirmOpen(false);

      if (onApplied) {
        onApplied();
      }
    } catch (e: any) {
      setApplyErr(e?.response?.data?.detail || "Failed to apply changes");
    } finally {
      setApplyBusy(false);
    }
  }

  return (
    <div className="rounded border bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-neutral-700">
          Preview suggestions for {start} → {end}
        </div>
        <button
          className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
          onClick={run}
          disabled={loading}
        >
          {loading ? "Running…" : "AI Recalc Preview"}
        </button>
      </div>

      {err && <div className="mb-2 text-sm text-red-600">{err}</div>}

      {suggestions.length > 0 && (
        <>
          <div className="mb-2 text-sm text-neutral-600">
            {suggestions.length} suggestion
            {suggestions.length !== 1 ? "s" : ""}:
          </div>
          <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
            {suggestions.map((s, i) => (
              <div key={i} className="rounded border p-2 text-sm">
                <div className="font-medium">
                  {s.date} — {s.workout_type}
                </div>
                {s.mi != null && <div>Distance: {s.mi} mi</div>}
                {s.pace && <div>Pace: {s.pace}</div>}
                {s.description && (
                  <div className="text-neutral-700">{s.description}</div>
                )}
                {s.notes && (
                  <div className="text-neutral-700">{s.notes}</div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              className="rounded bg-neutral-900 px-3 py-1 text-sm text-white disabled:opacity-50"
              onClick={() => setConfirmOpen(true)}
              disabled={!suggestions.length}
            >
              Apply Changes…
            </button>
            {applyResult && (
              <div className="text-xs text-green-700">{applyResult}</div>
            )}
          </div>
        </>
      )}

      {!loading && !err && suggestions.length === 0 && data && (
        <div className="text-sm text-neutral-600">
          No suggestions for this range.
        </div>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => !applyBusy && setConfirmOpen(false)}
        title="Apply AI suggestions?"
      >
        <p className="mb-3 text-sm text-neutral-800">
          You are about to apply <strong>{suggestions.length}</strong>{" "}
          workout change{suggestions.length !== 1 ? "s" : ""} to this plan.
          Existing workouts on those days will be updated; new ones will be
          created.
        </p>
        {applyErr && (
          <p className="mb-2 text-sm text-red-600">{applyErr}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="rounded bg-neutral-200 px-3 py-2 text-sm"
            onClick={() => setConfirmOpen(false)}
            disabled={applyBusy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
            onClick={applyChanges}
            disabled={applyBusy}
          >
            {applyBusy ? "Applying…" : "Confirm"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

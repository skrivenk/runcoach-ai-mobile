"use client";

import React, { useState } from "react";

export type Workout = {
  id: number;
  date: string;
  workout_type?: string | null;
  planned_distance?: number | null;
  planned_intensity?: string | null;
  description?: string | null;
  notes?: string | null;
  completed?: boolean;
  actual_distance?: number | null;
  actual_time_seconds?: number | null;
  actual_rpe?: number | null;
  avg_hr?: number | null;
  elevation_gain?: number | null;
  completion_notes?: string | null;
};

export type WorkoutUpdatePayload = {
  workout_type?: string | null;
  planned_distance?: number | null;
  planned_intensity?: string | null;
  description?: string | null;
  notes?: string | null;
};

type Props = {
  workout: Workout | null;
  onClose: () => void;
  onMarkComplete?: (workout: Workout) => void | Promise<void>;
  isCompleting?: boolean;
  onSaveDetails?: (
    workout: Workout,
    updates: WorkoutUpdatePayload
  ) => void | Promise<void>;
  isSavingDetails?: boolean;
};

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeSecs(secs?: number | null) {
  if (secs == null) return "";
  const m = Math.floor(secs / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h > 0) return `${h}h ${mm}m`;
  return `${m} min`;
}

export default function WorkoutDrawer({
  workout,
  onClose,
  onMarkComplete,
  isCompleting = false,
  onSaveDetails,
  isSavingDetails = false,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [editType, setEditType] = useState("");
  const [editDistance, setEditDistance] = useState("");
  const [editIntensity, setEditIntensity] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editNotes, setEditNotes] = useState("");

  if (!workout) return null;

  const {
    workout_type,
    planned_distance,
    planned_intensity,
    description,
    notes,
    completed,
    actual_distance,
    actual_time_seconds,
    actual_rpe,
    avg_hr,
    elevation_gain,
    completion_notes,
  } = workout;

  // Initialize edit fields when entering edit mode
  function startEdit() {
    setEditType(workout_type ?? "");
    setEditDistance(
      planned_distance != null ? String(planned_distance) : ""
    );
    setEditIntensity(planned_intensity ?? "");
    setEditDescription(description ?? "");
    setEditNotes(notes ?? "");
    setEditMode(true);
  }

  async function handleSave() {
    if (!onSaveDetails) {
      setEditMode(false);
      return;
    }

    const updates: WorkoutUpdatePayload = {};

    const t = editType.trim();
    updates.workout_type = t.length ? t : null;

    const distStr = editDistance.trim();
    if (distStr.length) {
      const num = Number(distStr);
      if (!Number.isNaN(num)) {
        updates.planned_distance = num;
      }
    } else {
      updates.planned_distance = null;
    }

    const intensity = editIntensity.trim();
    updates.planned_intensity = intensity.length ? intensity : null;

    const desc = editDescription.trim();
    updates.description = desc.length ? desc : null;

    const n = editNotes.trim();
    updates.notes = n.length ? n : null;

    try {
      await onSaveDetails(workout, updates);
      setEditMode(false);
    } catch (err) {
      console.error("Failed to save workout details", err);
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom sheet with a gap from the bottom */}
      <div className="fixed inset-x-0 bottom-8 z-50 mx-auto max-w-lg rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <div className="text-xs uppercase text-neutral-500">
              {formatDate(workout.date)}
            </div>
            <div className="text-base font-semibold">
              {(editMode ? editType : workout_type) || "Run"}
              {(editMode ? editDistance : planned_distance) != null &&
              (editMode ? editDistance : planned_distance) !== "" ? (
                <>
                  {" · "}
                  {editMode
                    ? editDistance
                    : planned_distance != null
                    ? `${planned_distance}`
                    : ""}
                  {" mi"}
                </>
              ) : null}
            </div>
            {!editMode && planned_intensity && (
              <div className="text-xs text-neutral-600">
                Intensity: {planned_intensity}
              </div>
            )}
            {editMode && (
              <div className="text-xs text-neutral-600">
                Editing planned details
              </div>
            )}
          </div>
          <div className="ml-3 flex gap-2">
            {onSaveDetails && !completed && (
              <button
                type="button"
                onClick={editMode ? handleSave : startEdit}
                className="inline-flex items-center rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700 disabled:opacity-60"
                disabled={isSavingDetails}
              >
                {editMode
                  ? isSavingDetails
                    ? "Saving…"
                    : "Save"
                  : "Edit"}
              </button>
            )}
            {editMode && (
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-xs text-neutral-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Edit fields */}
        {editMode ? (
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-[90px,1fr] items-center gap-2">
              <label className="text-right text-neutral-600">
                Type
              </label>
              <input
                className="rounded border border-neutral-300 px-2 py-1 text-xs"
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                placeholder="e.g. Easy, Tempo, Long"
              />
            </div>
            <div className="grid grid-cols-[90px,1fr] items-center gap-2">
              <label className="text-right text-neutral-600">
                Distance (mi)
              </label>
              <input
                className="rounded border border-neutral-300 px-2 py-1 text-xs"
                value={editDistance}
                onChange={(e) => setEditDistance(e.target.value)}
                placeholder="e.g. 5"
                inputMode="decimal"
              />
            </div>
            <div className="grid grid-cols-[90px,1fr] items-center gap-2">
              <label className="text-right text-neutral-600">
                Intensity
              </label>
              <input
                className="rounded border border-neutral-300 px-2 py-1 text-xs"
                value={editIntensity}
                onChange={(e) => setEditIntensity(e.target.value)}
                placeholder="easy / moderate / hard"
              />
            </div>
            <div className="grid grid-cols-[90px,1fr] gap-2">
              <label className="mt-1 text-right text-neutral-600">
                Description
              </label>
              <textarea
                className="min-h-[60px] rounded border border-neutral-300 px-2 py-1 text-xs"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Workout details"
              />
            </div>
            <div className="grid grid-cols-[90px,1fr] gap-2">
              <label className="mt-1 text-right text-neutral-600">
                Notes
              </label>
              <textarea
                className="min-h-[40px] rounded border border-neutral-300 px-2 py-1 text-xs"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Any extra notes"
              />
            </div>
          </div>
        ) : (
          <>
            {description && (
              <div className="mb-2 text-xs text-neutral-800">
                {description}
              </div>
            )}
            {notes && (
              <div className="mb-2 text-xs text-neutral-700">
                <span className="font-medium">Coach notes: </span>
                {notes}
              </div>
            )}
          </>
        )}

        <div className="mt-2 space-y-1 rounded-md bg-neutral-50 p-2 text-xs text-neutral-700">
          <div className="font-semibold text-neutral-800">Planned</div>
          <div>
            Distance:{" "}
            {planned_distance != null ? `${planned_distance} mi` : "—"}
          </div>
          {planned_intensity && <div>Intensity: {planned_intensity}</div>}
        </div>

        {(completed ||
          actual_distance != null ||
          actual_time_seconds != null ||
          completion_notes) && (
          <div className="mt-3 space-y-1 rounded-md bg-emerald-50 p-2 text-xs text-emerald-900">
            <div className="font-semibold">
              Completed {completed ? "✓" : ""}
            </div>
            {actual_distance != null && (
              <div>Distance: {actual_distance} mi</div>
            )}
            {actual_time_seconds != null && (
              <div>Time: {formatTimeSecs(actual_time_seconds)}</div>
            )}
            {actual_rpe != null && <div>RPE: {actual_rpe}</div>}
            {avg_hr != null && <div>Avg HR: {avg_hr} bpm</div>}
            {elevation_gain != null && (
              <div>Elevation: {elevation_gain} ft</div>
            )}
            {completion_notes && (
              <div>Notes: {completion_notes}</div>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-800"
            onClick={onClose}
          >
            Close
          </button>
          {onMarkComplete && !completed && (
            <button
              type="button"
              className="rounded bg-black px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
              onClick={() => onMarkComplete(workout)}
              disabled={isCompleting}
            >
              {isCompleting ? "Marking…" : "Mark complete"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

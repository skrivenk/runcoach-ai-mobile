// components/month-grid.tsx
"use client";

type RenderCell = (d: Date) => React.ReactNode;

function getWeekdayLabels(): string[] {
  // Force stable English short labels (Mon → Sun) regardless of browser locale
  const baseMonday = new Date(2024, 0, 1); // Jan 1, 2024 was a Monday
  const fmt = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const labels: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseMonday);
    d.setDate(baseMonday.getDate() + i);
    labels.push(fmt.format(d)); // e.g. "Mon", "Tue", ...
  }
  return labels;
}

export function MonthGrid({
  year,
  month, // 1-12
  renderCell,
  weekStartsOn = 1, // 1 = Monday, 0 = Sunday
}: {
  year: number;
  month: number;
  renderCell?: RenderCell;
  weekStartsOn?: 0 | 1;
}) {
  const labels = getWeekdayLabels(); // ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

  const firstOfMonth = new Date(year, month - 1, 1);
  const firstDay = firstOfMonth.getDay(); // 0=Sun..6=Sat
  // Compute how many days to back up to get to the start of the grid row
  const offset = ((firstDay - weekStartsOn + 7) % 7);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - offset);

  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }

  const inSameMonth = (d: Date) => d.getMonth() === firstOfMonth.getMonth();

  return (
    <div className="space-y-1">
      {/* Headers */}
      <div className="grid grid-cols-7 gap-1">
        {labels.map((h) => (
          <div
            key={h}
            className="text-xs font-semibold text-neutral-600 px-2 py-1 uppercase tracking-wide"
          >
            {h} {/* e.g., Mon, Tue, ... */}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => (
          <div
            key={i}
            className={`rounded border p-2 h-24 bg-white ${
              inSameMonth(d) ? "" : "opacity-50"
            }`}
          >
            <div className="text-xs text-neutral-500">{d.getDate()}</div>
            <div className="mt-1 text-xs">{renderCell?.(d)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

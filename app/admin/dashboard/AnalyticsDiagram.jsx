// app/admin/dashboard/AnalyticsDiagram.jsx
"use client";

import { useMemo, useState } from "react";
import { parseISO, subDays, isWithinInterval, addDays } from "date-fns";
import { AreaDiagram } from "./DashboardDiagram";
import { Button } from "@/_components/ui/Button";

const PRESET_RANGES = {
  last7:  { label: "Last 7 days",  getRange: () => ({ start: subDays(new Date(), 6),  end: new Date() }) },
  last14: { label: "Last 14 days", getRange: () => ({ start: subDays(new Date(), 13), end: new Date() }) },
  last30: { label: "Last 30 days", getRange: () => ({ start: subDays(new Date(), 29), end: new Date() }) },
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AnalyticsDiagram({ attendanceRaw = [] }) {
  const [rangeKey, setRangeKey] = useState("last7");

  const parsedAttendances = useMemo(() => {
    return attendanceRaw.map((r) => ({
      date: parseISO(r.date),
      status: r.status
    }));
  }, [attendanceRaw]);

  const { start, end } = useMemo(() => {
    const { getRange } = PRESET_RANGES[rangeKey];
    const r = getRange();
    r.start.setHours(0, 0, 0, 0);
    r.end.setHours(23, 59, 59, 999);
    return r;
  }, [rangeKey]);

  const chartData = useMemo(() => {
    const map = {};

    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      const key = d.toISOString().split("T")[0];
      map[key] = { date: key, name: dayNames[d.getDay()],
        present: 0,
        late: 0,
        absent: 0,
        permission: 0,
      };
    }

    for (const a of parsedAttendances) {
      if (!a.date) continue;
      if (!isWithinInterval(a.date, { start, end })) continue;
      const key = a.date.toISOString().split("T")[0];
      if (!map[key]) continue;

      if (a.status === "PRESENT") map[key].present += 1;
      else if (a.status === "LATE") map[key].late += 1;
      else if (a.status === "ABSENT" || a.status === "ALPHA") map[key].absent += 1;
      else if (a.status === "PERMISSION") map[key].permission += 1;
    }

    return Object.keys(map).sort().map((k) => map[k]);
  }, [parsedAttendances, start, end]);

  const series = [
    { key: "present", color: "#3b82f6", label: "Present" },
    { key: "late", color: "#ffdf20", label: "Late" },
    { key: "absent", color: "#ffa2a2", label: "Absent" },
    { key: "permission", color: "#7bf1a8", label: "Permission" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-700">Attendance Overview</h3>
          <p className="text-xs text-slate-400">
            Showing {PRESET_RANGES[rangeKey].label}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {Object.keys(PRESET_RANGES).map((k) => (
            <Button key={k} size="sm" variant="outline"
              className={k === rangeKey ? "text-sky-700 bg-sky-100 border-sky-200 hover:bg-sky-200" : ""}
              onClick={() => setRangeKey(k)}
            >
              {PRESET_RANGES[k].label}
            </Button>
          ))}
        </div>
      </div>

      <AreaDiagram
        data={chartData}
        series={series}
      />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ChartNoAxesCombined } from "lucide-react";
import { parseISO, subDays, isWithinInterval, addDays, format } from "date-fns";

import { DashboardDiagram } from "./DashboardDiagram";
import { Button } from "@/_components/ui/Button";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select";

const PRESET_RANGES = {
  last7: { label: "7 Days", getRange: () => ({ start: subDays(new Date(), 6), end: new Date() }) },
  last14: { label: "14 Days", getRange: () => ({ start: subDays(new Date(), 13), end: new Date() }) },
  last30: { label: "30 Days", getRange: () => ({ start: subDays(new Date(), 29), end: new Date() }) },
};

// Helper untuk format label hari
function getDayLabel(date, rangeKey) {
  if (rangeKey === "last7") {
    return format(date, "EEEE");
  } else {
    return format(date, "dd EE"); // Mon 27, Tue 28, ...
  }
}

export default function AnalyticsDiagram({ attendanceRaw = [] }) {
  const [rangeKey, setRangeKey] = useState("last7");
  const [statusFilter, setStatusFilter] = useState("all");

  // Parse tanggal
  const parsedAttendances = useMemo(() => {
    return attendanceRaw.map((r) => ({
      date: parseISO(r.date),
      status: r.status
    }));
  }, [attendanceRaw]);

  // Hitung start & end
  const { start, end } = useMemo(() => {
    const { getRange } = PRESET_RANGES[rangeKey];
    const r = getRange();
    r.start.setHours(0, 0, 0, 0);
    r.end.setHours(23, 59, 59, 999);
    return r;
  }, [rangeKey]);

  // Total hari di range
  const totalDays = useMemo(() => (end - start) / (1000 * 60 * 60 * 24) + 1, [start, end]);

  // Generate chartData
  const chartData = useMemo(() => {
    const map = {};

    // Init map per tanggal
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      const key = d.toISOString().split("T")[0];
      map[key] = {
        date: key,
        name: getDayLabel(d, rangeKey),
        present: 0,
        late: 0,
        absent: 0,
        permission: 0,
      };
    }

    // Hitung attendance per tanggal
    for (const a of parsedAttendances) {
      if (!a.date) continue;
      if (!isWithinInterval(a.date, { start, end })) continue;
      const key = a.date.toISOString().split("T")[0];
      if (!map[key]) continue;

      if (statusFilter !== "all" && a.status !== statusFilter) continue;

      if (a.status === "PRESENT") map[key].present += 1;
      else if (a.status === "LATE") map[key].late += 1;
      else if (a.status === "ABSENT" || a.status === "ALPHA") map[key].absent += 1;
      else if (a.status === "PERMISSION") map[key].permission += 1;
    }

    return Object.keys(map).sort().map((k) => map[k]);
  }, [parsedAttendances, start, end, statusFilter, totalDays]);

  // Series chart
  const series = useMemo(() => {
    const base = [
      { key: "absent", color: "#fb2c36", label: "Absent" },
      { key: "late", color: "#efb100", label: "Late" },
      { key: "present", color: "#00bba7", label: "Present" },
      { key: "permission", color: "#2b7fff", label: "Permission" },
    ];
    if (statusFilter === "all") return base;
    return base.filter((s) => s.key.toUpperCase() === statusFilter);
  }, [statusFilter]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-50 border border-purple-100 text-purple-500 p-2 rounded-lg">
              <ChartNoAxesCombined strokeWidth={2} />
            </div>
            <ContentInformation title="Analytics" subtitle={`Views statistic in ${PRESET_RANGES[rangeKey].label}`} autoMargin={false} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-slate-400">Filter Last : </span>
          <div className="flex items-center gap-2">
            {Object.keys(PRESET_RANGES).map((k) => (
              <Button key={k} size="sm" variant="outline"
                className={k === rangeKey ? "text-indigo-700 bg-indigo-50 border-indigo-200/60 hover:bg-indigo-100/80" : ""}
                onClick={() => setRangeKey(k)}
              >
                {PRESET_RANGES[k].label}
              </Button>
            ))}
          </div>
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
            <SelectTrigger className="w-auto px-3 whitespace-nowrap" size="sm">
              <span className="font-semibold text-slate-600 mr-1">Attendance:</span>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ABSENT">Absent</SelectItem>
              <SelectItem value="LATE">Late</SelectItem>
              <SelectItem value="PRESENT">Present</SelectItem>
              <SelectItem value="PERMISSION">Permission</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DashboardDiagram
        data={chartData}
        series={series}
      />
    </div>
  );
}

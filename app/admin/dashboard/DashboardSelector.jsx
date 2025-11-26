"use client";

import { useChartStore } from "@/_stores/useChartStore";
import { DATE_RANGES } from "@/_constants/static/filterAttendanceGraphic";

export default function DashboardSelector() {
  const { selectedRange, setRange } = useChartStore();

  return (
    <select className="border rounded p-2" value={selectedRange} onChange={(e) => setRange(e.target.value)}>
      {Object.entries(DATE_RANGES).map(([key, item]) => (
        <option key={key} value={key}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
"use client"

import { exportWordTemplate } from "../utils/ExportWordTemplate";

export function exportWord(schedules = []) {
  if (!schedules || schedules.length === 0) return;

  const columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Title", key: "title", width: 22 },
    { header: "Frequency", key: "frequency", width: 14 },
    { header: "Start Date", key: "startDate", width: 16 },
    { header: "End Date", key: "endDate", width: 16 },
    { header: "Time", key: "time", width: 18 },
    { header: "Created At", key: "createdAt", width: 18 },
  ];

  const data = schedules.map((s) => ({
    title: s.title,
    frequency: s.frequency,
    startDate: new Date(s.startDate).toLocaleDateString("id-ID"),
    endDate: new Date(s.endDate).toLocaleDateString("id-ID"),
    time: s.startTime + " - " + s.endTime,
    createdAt: new Date(s.createdAt).toLocaleDateString("id-ID"),
  }));

  exportWordTemplate({
    title: "Schedule Report",
    sheetName: "Schedule Report",
    columns,
    data
  });
}

"use client";

import { useCallback, useState } from "react";

export function useHandleUserAttendanceHistory(initialData = []) {
  const [data, setData] = useState(initialData);
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback((checked, currentIds) => {
    setSelectedIds(checked ? currentIds : []);
  }, []);

  const removeSelected = useCallback(() => {
    if (!selectedIds.length) return;

    setData((prev) => prev.filter((h) => !selectedIds.includes(h.id)));
    setSelectedIds([]);
  }, [selectedIds]);

  const removeAll = useCallback(() => {
    setData([]);
    setSelectedIds([]);
  }, []);

  const exportData = useCallback((rows) => {
    if (!rows?.length) return;

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "attendance-history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    data, setData,
    selectedIds,

    toggleSelect, toggleSelectAll,
    removeSelected, removeAll,

    exportData,
  };
}

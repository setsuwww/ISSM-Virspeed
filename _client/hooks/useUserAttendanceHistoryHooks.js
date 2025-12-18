"use client";

import { useMemo, useState } from "react";
import { useHandleUserAttendanceHistory } from "../handlers/useHandleUserAttendaceHistory";

export function useUserAttendanceHistoryHooks(history = []) {
  const [search, setSearch] = useState("");

  const {
    data,
    setData,
    selectedIds,

    toggleSelect,
    toggleSelectAll,

    removeSelected,
    removeAll,
    exportData,
  } = useHandleUserAttendanceHistory(history);

  const filteredData = useMemo(() => {
    if (!search) return data;

    const q = search.trim().toLowerCase();

    return data.filter((h) => {
      const source =
        `${h.day}-${h.month}-${h.year}`.toLowerCase() ||
        `${h.dmy}`.toLowerCase();

      return source.includes(q);
    });
  }, [data, search]);

  return {
    search, setSearch,
    data, filteredData,
    selectedIds,

    toggleSelect, toggleSelectAll,
    removeSelected, removeAll,

    exportData,
  };
}

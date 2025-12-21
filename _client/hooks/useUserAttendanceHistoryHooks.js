"use client";

import { useMemo, useState } from "react";
import { useHandleUserAttendanceHistory } from "../handlers/useHandleUserAttendaceHistory";

export function useUserAttendanceHistoryHooks(history = []) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("desc");

  const {
    data,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    removeSelected,
    removeAll,
  } = useHandleUserAttendanceHistory(history);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (status !== "all") {
      result = result.filter((h) => h.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((h) =>
        `${h.day}-${h.month}-${h.year} ${h.dmy}`.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sort === "desc" ? db - da : da - db;
    });

    return result;
  }, [data, search, status, sort]);

  return {
    search,
    setSearch,
    status,
    setStatus,
    sort,
    setSort,

    filteredData,
    selectedIds,

    toggleSelect,
    toggleSelectAll,
    removeSelected,
    removeAll,
  };
}

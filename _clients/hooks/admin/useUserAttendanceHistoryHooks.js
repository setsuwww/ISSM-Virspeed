"use client";

import { useMemo, useState } from "react";
import { useHandleUserAttendanceHistory } from "../../handlers/admin/useHandleUserAttendaceHistory";

export function useUserAttendanceHistoryHooks(history = []) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("desc");

  const {
    data, selectedIds,
    toggleSelect, toggleSelectAll,
    removeSelected, removeAll,
  } = useHandleUserAttendanceHistory(history);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (status !== "all") {
      result = result.filter((h) => h.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((h) =>
        `${h.day} ${h.dmy}`.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) =>
      sort === "desc" ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );

    return result;
  }, [data, search, status, sort]);

  return {
    search, setSearch,
    status, setStatus,
    sort, setSort,
    filteredData,
    selectedIds,
    toggleSelect, toggleSelectAll,
    removeSelected, removeAll,
  };
}

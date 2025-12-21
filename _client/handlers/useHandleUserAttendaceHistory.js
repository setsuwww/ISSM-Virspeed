"use client";

import { useCallback, useState } from "react";

export function useHandleUserAttendanceHistory(initialData = []) {
  const [data, setData] = useState(initialData);
  const [selectedIds, setSelectedIds] = useState([])

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback((checked, ids) => {
    setSelectedIds(checked ? ids : []);
  }, []);

  const removeSelected = useCallback(() => {
    setData((prev) => prev.filter((h) => !selectedIds.includes(h.id)));
    setSelectedIds([]);
  }, [selectedIds]);

  const removeAll = useCallback(() => {
    setData([]);
    setSelectedIds([]);
  }, []);

  return {
    data,
    setData,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    removeSelected,
    removeAll,
  };
}

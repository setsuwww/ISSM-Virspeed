"use client";

import { useCallback, useMemo, useState } from "react";

export function useSelection(initialSelected = []) {
  const [selectedIds, setSelectedIds] = useState(initialSelected);

  const selectedIdsSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const isSelected = useCallback((id) => selectedIdsSet.has(id), [selectedIdsSet]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const selectAllFromItems = useCallback((items, getId = (item) => item.id) => {
    setSelectedIds(items.map((item) => getId(item)));
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const areAllSelected = useCallback(
    (itemsLength) => itemsLength > 0 && selectedIds.length === itemsLength,
    [selectedIds]
  );

  return {
    selectedIds,
    setSelectedIds,
    selectedIdsSet,
    isSelected,
    toggleSelect,
    selectAllFromItems,
    clearSelection,
    areAllSelected,
  };
}

"use client";

import useSWR from "swr";
import { useState, useMemo, useCallback } from "react";
import { useHandleDivisions } from "../../handlers/admin/useHandleDivisions";
import { useDebounce } from "@/_stores/common/useDebounce";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function useDivisionsHooks(initialData) {
  const { data: swrResult, mutate } = useSWR("/api/divisions", fetcher, {
    fallbackData: { data: initialData, total: initialData.length },
  });

  const listData = swrResult?.data ?? initialData ?? [];

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredData = useMemo(() => {
    const q = (debouncedSearch || "").toString().toLowerCase();
    return listData.filter((division) => {
      const name = (division.name || "").toString().toLowerCase();
      const matchSearch = !q || name.includes(q);
      const matchType = typeFilter === "all" || division.type === typeFilter;
      const matchStatus = statusFilter === "all" || division.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [listData, debouncedSearch, typeFilter, statusFilter]);

  const handlers = useHandleDivisions({
    filteredData,
    selectedIds,
    setSelectedIds,
    mutate,
  });

  const {
    toggleSelect, toggleSelectAll,
    handleDeleteSelected, handleDeleteAll,
    onEdit, onDelete,
    onToggleStatus, onToggleType, onBulkGlobalUpdate, onBulkUpdate,
  } = handlers;


  const handleActivateSelected = useCallback(
    () => onBulkUpdate(selectedIds, "ACTIVE"),
    [onBulkUpdate, selectedIds]
  )

  const handleInactivateSelected = useCallback(
    () => onBulkUpdate(selectedIds, "INACTIVE"),
    [onBulkUpdate, selectedIds]
  )

  return {
    mutate, search, setSearch,
    typeFilter, setTypeFilter,
    statusFilter, setStatusFilter, filteredData,
    selectedIds,

    toggleSelect, toggleSelectAll,
    handleDeleteSelected, handleDeleteAll,
    onEdit, onDelete, handleActivateSelected, handleInactivateSelected,
    onToggleStatus, onToggleType, onBulkGlobalUpdate, onBulkUpdate,
  };
}

"use client";

import useSWR from "swr";
import { useState, useMemo } from "react";
import { useHandleDivisions } from "../handlers/useHandleDivisions";

const fetcher = (url) => fetch(url).then((res) => res.json());

export function useDivisionsHooks(initialData) {
  const { data: swrResult, mutate } = useSWR("/api/divisions", fetcher, {
    fallbackData: { data: initialData, total: initialData.length },
  });

  const listData = swrResult?.data ?? initialData ?? [];

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredData = useMemo(() => {
    const q = (search || "").toString().toLowerCase();
    return listData.filter((division) => {
      const name = (division.name || "").toString().toLowerCase();
      const matchSearch = !q || name.includes(q);
      const matchType = typeFilter === "all" || division.type === typeFilter;
      const matchStatus = statusFilter === "all" || division.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [listData, search, typeFilter, statusFilter]);

  const handlers = useHandleDivisions({
    filteredData,
    selectedIds,
    setSelectedIds,
    mutate,
  });

  const {
    toggleSelect,
    toggleSelectAll,
    handleDeleteSelected,
    handleDeleteAll,
    handleExportPDF: maybeHandleExportPDF,
    onEdit,
    onDelete,
    onToggleStatus,
    onBulkUpdate,
  } = handlers;

  const handleExportPDF = maybeHandleExportPDF || handlers.onExportPDF || handlers.onExport || (() => {});

  return {
    mutate,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    filteredData,
    selectedIds,

    toggleSelect,
    toggleSelectAll,
    handleDeleteSelected,
    handleDeleteAll,
    handleExportPDF,
    onEdit,
    onDelete,
    onToggleStatus,
    onBulkUpdate,
  };
}

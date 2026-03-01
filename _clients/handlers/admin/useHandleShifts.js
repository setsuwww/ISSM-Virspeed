"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useCallback, useTransition } from "react";

import { deleteShiftById, deleteShifts } from "@/_servers/admin-action/shiftAction";

import { useActionHelper } from "@/_stores/common/useActionStore";
import { useToast } from "@/_contexts/Toast-Provider";

export function useHandleShifts(data) {
  const router = useRouter();
  const toast = useToast();
  const { withTry, withConfirm } = useActionHelper();
  const [isPending, startTransition] = useTransition();

  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [sortFilter, setSortFilter] = useState("A-Z");
  const [shiftFilter, setShiftFilter] = useState("ALL");

  const filteredData = useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) =>
        s.name.toLowerCase().includes(q)
      );
    }

    if (shiftFilter !== "ALL") {
      result = result.filter((s) => s.type === shiftFilter);
    }

    const sorted = [...result];

    if (sortFilter === "A-Z")
      sorted.sort((a, b) => a.name.localeCompare(b.name));

    if (sortFilter === "Z-A")
      sorted.sort((a, b) => b.name.localeCompare(a.name));

    return sorted;
  }, [data, search, shiftFilter, sortFilter]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(
    (checked) => {
      setSelectedIds(
        checked ? filteredData.map((s) => s.id) : []
      );
    },
    [filteredData]
  );

  const isAllSelected =
    filteredData.length > 0 &&
    selectedIds.length === filteredData.length;

  const handleEditShift = useCallback(
    (id) => {
      router.push(`/admin/dashboard/shifts/${id}/edit`);
    },
    [router]
  );

  const handleDeleteShift = useCallback(
    (id) => {
      startTransition(async () => {
        await withConfirm(
          "Are you sure you want to delete this shift?",
          async () => {
            await withTry(
              () => deleteShiftById(id),
              "Shift deleted successfully.",
              "Failed to delete shift."
            );
            router.refresh();
          }
        );
      });
    },
    [router, withConfirm, withTry]
  );

  const deleteSelected = useCallback(() => {
    if (!selectedIds.length) {
      toast.error("No shifts selected.");
      return;
    }

    startTransition(async () => {
      await withConfirm(
        `Delete ${selectedIds.length} selected shifts?`,
        async () => {
          await withTry(
            () => deleteShifts(selectedIds),
            "Selected shifts deleted.",
            "Failed to delete selected shifts."
          );
          setSelectedIds([]);
          router.refresh();
        }
      );
    });
  }, [selectedIds, router, withConfirm, withTry, toast]);

  const deleteAll = useCallback(() => {
    if (!filteredData.length) {
      toast.error("No shifts available.");
      return;
    }

    startTransition(async () => {
      await withConfirm(
        `Delete all ${filteredData.length} shifts?`,
        async () => {
          await withTry(
            () =>
              deleteShifts(filteredData.map((s) => s.id)),
            "All shifts deleted.",
            "Failed to delete all shifts."
          );
          setSelectedIds([]);
          router.refresh();
        }
      );
    });
  }, [filteredData, router, withConfirm, withTry, toast]);

  return {
    search,
    setSearch,
    sortFilter,
    setSortFilter,
    shiftFilter,
    setShiftFilter,
    selectedIds,
    filteredData,
    isAllSelected,
    isPending,

    toggleSelect,
    selectAll,
    handleEditShift,
    handleDeleteShift,
    deleteSelected,
    deleteAll,
  };
}

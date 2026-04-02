"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/_lib/api";
import { useConfirmStore } from "@/_stores/common/useConfirmStore";
import { confirmMessages, MSG } from "@/_constants/static/handleEmployeeMessage";
import { deleteUserById } from "@/_servers/admin-action/userAction";
import { useDebounce } from "@/_stores/common/useDebounce";

const askConfirm = useConfirmStore.getState().ask;

export function useShiftEmployeesHooks(users = []) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [selected, setSelected] = useState([]);
  const [divisionFilter, setLocationFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");

  const [data, setData] = useState([]);

  useEffect(() => {
    const employees = (users || []).filter((u) => u.role === "EMPLOYEE");
    setData(employees);
  }, [users]);

  const filteredData = useMemo(() => {
    if (!data.length) return [];

    const q = debouncedSearch.trim().toLowerCase();

    return data.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();

      const matchSearch = !q || name.includes(q) || email.includes(q);
      const matchLocation = divisionFilter === "all" || u.division?.id === Number(divisionFilter);
      const matchShift = shiftFilter === "all" || u.shift?.type === shiftFilter;

      return matchSearch && matchLocation && matchShift;
    });
  }, [data, debouncedSearch, divisionFilter, shiftFilter]);

  const toggleSelect = useCallback((id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelected([]);
  }, []);

  const deleteSelected = useCallback(async () => {
    if (!selected.length) {
      alert(MSG.NO_SELECTED);
      return;
    }

    const { message, variant } =
      confirmMessages.deleteSelected(selected.length);

    const confirmed = await askConfirm(message, variant);
    if (!confirmed) return;

    setData((prev) =>
      prev.filter((u) => !selected.includes(u.id))
    );

    clearSelection();
  }, [selected, clearSelection]);

  const onDelete = useCallback(async (id) => {
    const { message, variant } = confirmMessages.deleteOne;

    const confirmed = await askConfirm(message, variant);
    if (!confirmed) return;

    await deleteUserById(id);

    setData((prev) =>
      prev.filter((u) => u.id !== id)
    );
  }, []);

  const onSwitch = useCallback(async (id, newActiveState) => {
    try {
      await api.patch(`/users/${id}`, {
        active: newActiveState,
      });

      setData((prev) =>
        prev.map((u) => u.id === id
          ? { ...u, active: newActiveState } : u
        )
      );
    } catch { alert(MSG.UPDATE_FAIL) }
  }, []);

  const onEdit = useCallback(
    (id) => { router.push(`/admin/dashboard/users/${id}/edit`) },
    [router]
  );

  const onHistory = useCallback(
    (id) => { router.push(`/admin/dashboard/users/${id}/history`) },
    [router]
  );

  return {
    data,
    search, setSearch,
    selected, filteredData,
    divisionFilter, setLocationFilter,
    shiftFilter, setShiftFilter,
    toggleSelect, setSelected, deleteSelected, onDelete, onSwitch, onEdit, onHistory,
  };
}

"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/_lib/api";

import { useConfirmStore } from "@/_stores/common/useConfirmStore";
import { confirmMessages } from "@/_constants/static/handleEmployeeMessage";

import { deleteUserById } from "@/_servers/admin-action/userAction";

const askConfirm = useConfirmStore.getState().ask;

const MSG = {
  NO_SELECTED: "No employees selected.",
  UPDATE_FAIL: "Failed to update user state",
  DELETE_FAIL: "Failed to delete user",
};

export function useShiftEmployeesHooks(users) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [shiftFilter, onShiftFilterChange] = useState("all");

  const router = useRouter();

  const data = useMemo(() => (users || []).filter((u) => u.role === "EMPLOYEE"),
    [users]
  );

  const filteredData = useMemo(() => {
    return data.filter((u) => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchDivision = divisionFilter === "all" || u.division?.id === Number(divisionFilter);
      const matchShift = shiftFilter === "all" || u.shift?.type === shiftFilter;

      return matchSearch && matchDivision && matchShift;
    });
  }, [data, search, divisionFilter, shiftFilter]);

  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const deleteSelected = async () => {
    if (!selected.length) {
      alert(MSG.NO_SELECTED);
      return;
    }

    const { message, variant } = confirmMessages.deleteSelected(selected.length);
    const confirmed = await askConfirm(message, variant);
    if (!confirmed) return;

    setData((prev) => prev.filter((u) => !selected.includes(u.id)));
    setSelected([]);
  };

  const deleteAll = async () => {
    const { message, variant } = confirmMessages.deleteAll(filteredData.length);
    const confirmed = await askConfirm(message, variant);
    if (!confirmed) return;

    setData([]);
    setSelected([]);
  };

  const onEdit = useCallback((id) => {
    router.push(`/admin/dashboard/users/${id}/edit`);
  }, [router]);

  const onHistory = useCallback((id) => {
    router.push(`/admin/dashboard/users/${id}/history`);
  }, [router]);

  const onSwitch = useCallback(async (id, newActiveState) => {
    try {
      await api.patch(`/users/${id}`, { active: newActiveState });
      setData((prev) => prev.map((u) => u.id === id ? { ...u, active: newActiveState } : u));
    }
    catch { alert(MSG.UPDATE_FAIL); }
  }, []);

  const onDelete = useCallback(async (id) => {
    const { message, variant } = confirmMessages.deleteOne;

    const confirmed = await askConfirm(message, variant);
    if (!confirmed) return;

    await deleteUserById(id)
  }, []);

  return {
    search, setSearch, selected, setSelected,
    data, filteredData,
    divisionFilter, setDivisionFilter,
    shiftFilter, onShiftFilterChange,
    toggleSelect, deleteSelected, deleteAll,
    onHistory, onSwitch, onEdit, onDelete,
  };
}

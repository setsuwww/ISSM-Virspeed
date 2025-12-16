"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "@/_lib/api";

import { useConfirmStore } from "@/_stores/common/useConfirmStore";

const askConfirm = useConfirmStore.getState().ask;

const MSG = {
  NO_SELECTED: "No employees selected.",
  CONFIRM_DELETE_SELECTED: "Are you sure to delete selected employees?",
  CONFIRM_DELETE_ALL: "Are you sure to delete all employees?",
  CONFIRM_DELETE_ONE: "Are you sure to delete this user?",
  UPDATE_FAIL: "Failed to update user state",
  DELETE_FAIL: "Failed to delete user",
};

export function useEmployeesHooks(users, shifts) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [shiftFilter, onShiftFilterChange] = useState("all");

  const data = useMemo(() => (users || []).filter((u) => u.role === "EMPLOYEE"),
    [users]
  );

  const filteredData = useMemo(() => {
    return data.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchDivision =
        divisionFilter === "all" ||
        u.division?.id === Number(divisionFilter);

      const matchShift =
        shiftFilter === "all" ||
        u.shift?.type === shiftFilter;

      return matchSearch && matchDivision && matchShift;
    });
  }, [data, search, divisionFilter, shiftFilter]);

  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const deleteSelected = () => {
    if (!selected.length) return alert(MSG.NO_SELECTED);
    if (!askConfirm(MSG.CONFIRM_DELETE_SELECTED)) return;

    setData((prev) => prev.filter((u) => !selected.includes(u.id)));
    setSelected([]);
  };

  const deleteAll = () => {
    if (!askConfirm(MSG.CONFIRM_DELETE_ALL)) return;
    setData([]);
    setSelected([]);
  };

  const onSwitch = useCallback(async (id, newActiveState) => {
    try {
      await api.patch(`/users/${id}`, { active: newActiveState });
      setData((prev) => prev.map((u) => u.id === id ? { ...u, active: newActiveState } : u));
    }
    catch { alert(MSG.UPDATE_FAIL); }
  }, []);

  const onDelete = useCallback(async (id) => {
    if (!askConfirm(MSG.CONFIRM_DELETE_ONE)) return;

    try {
      await api.delete(`/users/${id}`);
      setData((prev) => prev.filter((u) => u.id !== id));
    }
    catch { alert(MSG.DELETE_FAIL); }
  }, []);

  return {
    search, setSearch, selected, setSelected,
    data, filteredData,
    divisionFilter, setDivisionFilter,
    shiftFilter, onShiftFilterChange,
    toggleSelect, deleteSelected, deleteAll,
    exportCSV,
    onSwitch, onDelete,
  };
}

"use client"

import { create } from "zustand"

export const useEmployeeSwitchStore = create((set) => ({
  selectedId: null,
  search: "",
  setSelectedId: (id) => set({ selectedId: id }),
  setSearch: (val) => set({ search: val }),
  reset: () => set({ selectedId: null, search: "" }),
}))

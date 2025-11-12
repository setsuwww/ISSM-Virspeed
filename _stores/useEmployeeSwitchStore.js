import { create } from "zustand"

export const useEmployeeSwitchStore = create((set) => ({
  selectedId: null,
  search: "",
  setSelectedId: (id) => set({ selectedId: id }),
  setSearch: (value) => set({ search: value }),
  reset: () => set({ selectedId: null, search: "" }),
}))

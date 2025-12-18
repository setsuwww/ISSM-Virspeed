import { create } from "zustand";

export const useConfirmStore = create((set, get) => ({
  open: false,
  message: "",
  variant: "warning",
  resolver: null,

  ask: (message, variant) => {
    return new Promise((resolve) => {
      set({
        open: true,
        message,
        variant,
        resolver: resolve,
      });
    });
  },

  confirm: () => {
    const resolve = get().resolver;
    resolve?.(true);
    set({ open: false, resolver: null });
  },

  cancel: () => {
    const resolve = get().resolver;
    resolve?.(false);
    set({ open: false, resolver: null });
  },
}));

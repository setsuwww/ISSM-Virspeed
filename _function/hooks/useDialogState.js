"use client";

import { useCallback, useState } from "react";

export function useDialogState(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);

  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => setOpen(false), []);
  const toggleDialog = useCallback(() => setOpen((prev) => !prev), []);

  return {
    open,
    setOpen,
    openDialog,
    closeDialog,
    toggleDialog,
  };
}

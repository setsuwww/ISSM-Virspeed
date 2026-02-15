"use client";

import { useToast } from "@/_contexts/Toast-Provider";
import { useConfirmStore } from "./useConfirmStore";

export function useActionHelper() {
  const toast = useToast();
  const askConfirm = useConfirmStore((s) => s.ask);

  const withConfirm = async (message, action, variant = "warning") => {
    const ok = await askConfirm(message, variant);
    if (!ok) return false;
    return await action();
  };

  const withTry = async (action, successMsg, errorMsg) => {
    try {
      const result = await action();

      if (result && result.success === false) {
        throw new Error(result.error || errorMsg);
      }

      toast.success(successMsg);
      return result;
    } catch (e) {
      toast.error(errorMsg);
      return null;
    }
  };


  return { withConfirm, withTry };
}

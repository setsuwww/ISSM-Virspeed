"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { deleteUsers, deleteUserWithId, getUserWithId } from "@/_server/userAction";
import { exportUser } from "@/_function/exports/exportUser";

import { useToast } from "@/_context/Toast-Provider";
import { useActionHelper } from "@/_stores/common/useActionHelper";

import { confirmMessages } from "@/_constants/static/handleUserMessage";

export function useHandleUsers({ filteredData, selectedIds, setSelectedIds }) {
  const toast = useToast();
  const router = useRouter();
  const { withConfirm, withTry } = useActionHelper();

  const toggleSelect = useCallback(
    (id) => { setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }, [setSelectedIds]
  );

  const selectAll = useCallback(
    (checked) => setSelectedIds(checked ? filteredData.map((u) => u.id) : []),
    [filteredData, setSelectedIds]
  );

  const isAllSelected = filteredData.length > 0 && selectedIds.length === filteredData.length;

  const deleteSelected = useCallback(async () => {
    if (!selectedIds.length) {toast.error("No users selected.");
      return;
    }

    const { message, variant } = confirmMessages.deleteSelected(selectedIds.length);

    await withConfirm(message,
      async () => { await withTry(() => deleteUsers(selectedIds),
          "Selected users deleted.", "Failed to delete selected users."
        );
        setSelectedIds([]);
      }, variant
    );
  }, [selectedIds, toast, setSelectedIds]);

  const deleteAll = useCallback(async () => {
    if (!filteredData.length) { toast.error("No users available.");
      return;
    }

    const { message, variant } = confirmMessages.deleteAll(
      filteredData.length
    );

    await withConfirm(message,
      async () => withTry(() => deleteUsers(filteredData.map((u) => u.id)),
          "All users have been deleted.", "Failed to delete all users."
        ), variant
    );

    setSelectedIds([]);
  }, [filteredData, setSelectedIds, toast]);

  const handleDeleteUser = useCallback(
    async (id) => { const { message, variant } = confirmMessages.deleteOne;

      await withConfirm(message,
        async () => { await withTry(() => deleteUserWithId(id),
            "User deleted successfully.", "Failed to delete user."
          );
          setSelectedIds((prev) => prev.filter((x) => x !== id));
        }, variant
      );
    }, [toast, setSelectedIds]
  );

  const handleEditUser = useCallback(
    async (id) => {
      router.push(`/admin/dashboard/users/${id}/edit`);
    }, [router]
  );

  const onExportPDF = useCallback(
    (data) => { exportUser(data);
      toast.success("PDF exported.");
    }, [toast]
  );

  return {
    toggleSelect, selectAll, isAllSelected, deleteSelected, deleteAll,
    handleEditUser, handleDeleteUser, onExportPDF,
  };
}

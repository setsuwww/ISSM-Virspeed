"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useActionHelper } from "@/_stores/common/useActionStore";

import { toggleDivisionStatus, deleteDivisionById, deleteDivisions, bulkToggleSelectedDivision, bulkToggle, toggleDivisionType } from "@/_servers/admin-action/divisionAction";

import { confirmMessages } from "@/_constants/static/handleDivisionMessage";

export function useHandleDivisions({ filteredData, selectedIds, setSelectedIds, mutate }) {
  const router = useRouter();
  const { withConfirm, withTry } = useActionHelper();

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, [setSelectedIds]);

  const selectAll = useCallback((checked) => {
    setSelectedIds(checked ? filteredData.map((d) => d.id) : []);
  }, [filteredData, setSelectedIds]);

  const onToggleStatus = useCallback(async (division) => {
    await withTry(
      () => toggleDivisionStatus(division.id),
      `Division "${division.name}" status updated.`,
      "Failed to update division status."
    );
    mutate?.();
  }, [withTry, mutate]);

  const onToggleType = useCallback(
    async (division) => {
      const nextType = division.type === "WFA" ? "WFO" : "WFA";

      await withConfirm(`Switch division "${division.name}" from ${division.type} to ${nextType}?`,
        async () => {
          const result = await withTry(
            () => toggleDivisionType(division.id),
            `Division switched to ${nextType}.`,
            "Failed to switch division type."
          );

          if (result?.success) {
            mutate?.();
          }
        },
        "warning"
      );
    },
    [withConfirm, withTry, mutate]
  );

  const onBulkGlobalUpdate = async (isActive) => {
    await withTry(() => bulkToggle({
      activateType: "WFA", deactivateType: "WFO",
      isActive,
    }),
      "Bulk status updated.", "Failed to update global toggle."
    );
    mutate?.();
  };

  const onBulkUpdate = async (ids, mode) => {
    const { message, variant } = confirmMessages.bulkUpdate(ids.length, mode);

    await withConfirm(message, () => withTry(() => bulkToggleSelectedDivision({
        ids, isActive: mode === "ACTIVE",
      }),
        `Divisions set to ${mode.toLowerCase()}.`, "Bulk update failed."
      ), variant
    ).then(() => mutate?.());
  };

  const handleEditDivision = useCallback((id) => {
    router.push(`/admin/dashboard/users/divisions/${id}/edit`);
  }, [router]);

  const handleDeleteDivision = useCallback(async (id, name) =>
    withConfirm(confirmMessages.deleteOne(name).message,
      () => withTry(() => deleteDivisionById(id),
        "Division successfully removed.", "Failed to delete division."
      ),
      confirmMessages.deleteOne(name).variant
    ).then(() => mutate?.()),
    [withTry, mutate]
  );

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return toast.error("No divisions selected.");

    const { message, variant } = confirmMessages.deleteSelected(selectedIds.length);

    await withConfirm(message,
      async () => {
        await withTry(() => Promise.all(selectedIds.map(deleteDivisionById)),
          `${selectedIds.length} divisions removed.`, "Failed to delete selected divisions."
        );
        setSelectedIds([]);
        mutate?.();
      },
      variant
    );
  };

  const handleDeleteAll = async () => {
    const { message, variant } = confirmMessages.deleteAll;

    await withConfirm(message,
      async () => {
        await withTry(deleteDivisions,
          "All divisions removed.", "Failed to delete all divisions."
        );
        mutate?.();
      }, variant
    );
  };

  return {
    toggleSelect,
    selectAll,

    onToggleStatus,
    onToggleType,
    handleEditDivision,
    handleDeleteDivision,
    handleDeleteSelected,
    handleDeleteAll,

    onBulkGlobalUpdate,
    onBulkUpdate,
  };
}

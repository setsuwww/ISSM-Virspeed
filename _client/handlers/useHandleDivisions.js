"use client";

import { useRouter } from "next/navigation";
import { useActionHelper } from "@/_stores/common/useActionHelper";

import { toggleDivisionStatus, deleteDivision, deleteAllDivisions, bulkToggleSelectedDivision, bulkToggle } from "@/_server/admin-action/divisionAction";

import { confirmMessages } from "@/_constants/static/handleDivisionMessage";

export function useHandleDivisions({
  filteredData, selectedIds, setSelectedIds, mutate,
}) {
  const router = useRouter();
  const { withConfirm, withTry } = useActionHelper();

  const toggleSelect = (id) => setSelectedIds((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );

  const toggleSelectAll = (checked) => setSelectedIds(checked ? filteredData.map((d) => d.id) : []);

  const onToggleStatus = async (division) =>
    withTry(() => toggleDivisionStatus(division.id),
      `Division "${division.name}" status updated.`, "Failed to update division status."
    ).then(() => mutate?.());

  const onDelete = async (id, name) =>
    withConfirm(confirmMessages.deleteOne(name).message,
      () => withTry(() => deleteDivision(id),
        "Division successfully removed.", "Failed to delete division."
      ),
      confirmMessages.deleteOne(name).variant
    ).then(() => mutate?.());

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return toast.error("No divisions selected.");

    const { message, variant } = confirmMessages.deleteSelected(selectedIds.length);

    await withConfirm(message,
      async () => { await withTry(() => Promise.all(selectedIds.map(deleteDivision)),
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
      async () => {await withTry(deleteAllDivisions,
          "All divisions removed.", "Failed to delete all divisions."
        );
        mutate?.();
      }, variant
    );
  };

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

    await withConfirm(message,
      () => withTry(() => bulkToggleSelectedDivision({
              ids, isActive: mode === "ACTIVE",
            }),
          `Divisions set to ${mode.toLowerCase()}.`, "Bulk update failed."
        ), variant
    ).then(() => mutate?.());
  };

  const onEdit = (id) => router.push(`/admin/dashboard/users/divisions/${id}/edit`);

  return {
    toggleSelect,
    toggleSelectAll,

    onToggleStatus,
    onDelete,
    handleDeleteSelected,
    handleDeleteAll,

    onBulkGlobalUpdate,
    onBulkUpdate,

    onEdit,
  };
}

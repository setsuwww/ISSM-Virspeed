"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useActionHelper } from "@/_stores/common/useActionStore";

import { toggleLocationStatus, deleteLocationById, deleteLocations, bulkToggleSelectedLocation, bulkToggle, toggleLocationType } from "@/_servers/admin-action/locationAction";

import { confirmMessages } from "@/_constants/static/handleLocationMessage";

export function useHandleLocations({ filteredData, selectedIds, setSelectedIds, mutate }) {
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

  const onToggleStatus = useCallback(async (location) => {
    await withTry(
      () => toggleLocationStatus(location.id),
      `Location "${location.name}" status updated.`,
      "Failed to update location status."
    );
    mutate?.();
  }, [withTry, mutate]);

  const onToggleType = useCallback(
    async (location) => {
      const nextType = location.type === "WFA" ? "WFO" : "WFA";

      await withConfirm(`Switch location "${location.name}" from ${location.type} to ${nextType}?`,
        async () => {
          const result = await withTry(
            () => toggleLocationType(location.id),
            `Location switched to ${nextType}.`,
            "Failed to switch location type."
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

    await withConfirm(message, () => withTry(() => bulkToggleSelectedLocation({
      ids, isActive: mode === "ACTIVE",
    }),
      `Locations set to ${mode.toLowerCase()}.`, "Bulk update failed."
    ), variant
    ).then(() => mutate?.());
  };

  const handleEditLocation = useCallback((id) => {
    router.push(`/admin/dashboard/users/locations/${id}/edit`);
  }, [router]);

  const handleDeleteLocation = useCallback(async (id, name) =>
    withConfirm(confirmMessages.deleteOne(name).message,
      () => withTry(() => deleteLocationById(id),
        "Location successfully removed.", "Failed to delete location."
      ),
      confirmMessages.deleteOne(name).variant
    ).then(() => mutate?.()),
    [withTry, mutate]
  );

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return toast.error("No locations selected.");

    const { message, variant } = confirmMessages.deleteSelected(selectedIds.length);

    await withConfirm(message,
      async () => {
        await withTry(() => Promise.all(selectedIds.map(deleteLocationById)),
          `${selectedIds.length} locations removed.`, "Failed to delete selected locations."
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
        await withTry(deleteLocations,
          "All locations removed.", "Failed to delete all locations."
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
    handleEditLocation,
    handleDeleteLocation,
    handleDeleteSelected,
    handleDeleteAll,

    onBulkGlobalUpdate,
    onBulkUpdate,
  };
}

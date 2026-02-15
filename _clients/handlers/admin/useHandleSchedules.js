"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useActionHelper } from "@/_stores/common/useActionStore";
import { useToast } from "@/_contexts/Toast-Provider";
import { deleteScheduleById, deleteSchedules } from "@/_servers/admin-action/scheduleAction";

import { confirmMessages } from "@/_constants/static/handleScheduleMessage";

export function useHandleSchedules({ selectedIds, setSelectedIds, filteredData, reloadData }) {
  const router = useRouter();
  const { withConfirm, withTry } = useActionHelper();
  const toast = useToast();

  const toggleSelect = useCallback(
    (id) => { setSelectedIds((prev) => prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id]
      );
    }, [setSelectedIds]
  );

  const selectAll = useCallback(() => {
    setSelectedIds((prev) => prev.length === filteredData.length ? [] : filteredData.map((s) => s.id));
  }, [filteredData, setSelectedIds]);

  const handleDeleteSchedule = useCallback(
    async (id) => { const { message, variant } = confirmMessages.deleteOne;

      await withConfirm(
        message,() =>
          withTry(() => deleteScheduleById(id),
            "Schedule deleted successfully.", "Failed to delete schedule."
          ), variant
      );
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
      reloadData();
    }, [setSelectedIds, reloadData]
  );

  const deleteSelected = useCallback(async () => {
    if (!selectedIds.length) { toast.error("No schedules selected.");
      return;
    }

    const { message, variant } = confirmMessages.deleteSelected(
      selectedIds.length
    );

    await withConfirm(message,
      async () => { await withTry(() => deleteSchedules(selectedIds),
          "Selected schedules deleted.", "Failed to delete selected schedules."
        );
        setSelectedIds([]);
        reloadData();
      }, variant
    );
  }, [selectedIds, setSelectedIds, reloadData, toast]);

  const deleteAll = useCallback(async () => {
    if (!filteredData.length) { toast.error("No schedules available.");
      return;
    }

    const { message, variant } = confirmMessages.deleteAll(
      filteredData.length
    );

    await withConfirm(message,
      async () => { await withTry(() => deleteSchedules(filteredData.map((s) => s.id)),
          "All schedules deleted.", "Failed to delete all schedules."
        );
        setSelectedIds([]);
        reloadData();
      },
      variant
    );
  }, [filteredData, setSelectedIds, reloadData, toast]);

  const handleEditSchedule = useCallback(
    (id) => router.push(`/admin/dashboard/schedules/${id}/edit`), [router]
  );

  return {
    toggleSelect, selectAll,
    deleteSelected, deleteAll,
    handleEditSchedule,
    handleDeleteSchedule,
  };
}

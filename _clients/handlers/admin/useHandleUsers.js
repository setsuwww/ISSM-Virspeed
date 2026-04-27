"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { deleteUsers, deleteUserById } from "@/_servers/admin-services/user_action";

import { useToast } from "@/_contexts/Toast-Provider";
import { useActionHelper } from "@/_stores/common/useActionStore";

import { confirmMessages } from "@/_components/_constants/static/handleUserMessage";

export function useHandleUsers({ filteredData, selectedIds, setSelectedIds }) {
    const toast = useToast();
    const router = useRouter();
    const { withConfirm, withTry } = useActionHelper();

    const toggleSelect = useCallback(
        (id) => {
            setSelectedIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            );
        }, [setSelectedIds]
    );

    const selectAll = useCallback(
        (checked) => setSelectedIds(checked ? filteredData.map((u) => u.id) : []),
        [filteredData, setSelectedIds]
    );

    const deleteSelected = useCallback(async () => {
        if (!selectedIds.length) {
            toast.error("No users selected.");
            return;
        }

        const { message, variant } = confirmMessages.deleteSelected(selectedIds.length);

        await withConfirm(message,
            async () => {
                await withTry(() => deleteUsers(selectedIds),
                    "Selected users deleted.", "Failed to delete selected users."
                );
                setSelectedIds([]);
            }, variant
        );
    }, [selectedIds, setSelectedIds, toast]);

    const deleteAll = useCallback(async () => {
        if (!filteredData.length) {
            toast.error("No users available.");
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

    const handleEditUser = useCallback(
        async (id) => {
            router.push(`/admin/dashboard/users/${id}/edit`);
        }, [router]
    );

    const handleDeleteUser = useCallback(
        async (id) => {
            const { message, variant } = confirmMessages.deleteOne;

            await withConfirm(message,
                async () => {
                    await withTry(() => deleteUserById(id),
                        "User deleted successfully.", "Failed to delete user."
                    );
                    setSelectedIds((prev) => prev.filter((x) => x !== id));
                }, variant
            );
        }, [toast, setSelectedIds]
    );

    const handleHistoryUser = useCallback(
        async (id) => {
            router.push(`/admin/dashboard/users/${id}/history`);
        }, [router]
    );

    const handleSwitchUser = useCallback(async (id, newActiveState) => {
        try {
            await api.patch(`/users/${id}`, {
                active: newActiveState,
            });

            setData((prev) =>
                prev.map((u) => u.id === id
                    ? { ...u, active: newActiveState } : u
                )
            );
        } catch { alert(MSG.UPDATE_FAIL) }
    }, []);

    return {
        toggleSelect, selectAll,
        deleteSelected, deleteAll,
        handleEditUser, handleDeleteUser, handleHistoryUser, handleSwitchUser
    };
}

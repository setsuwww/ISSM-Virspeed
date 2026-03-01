"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useCallback, useTransition } from "react";
import {
    deleteShiftById,
    deleteShifts,
} from "@/_servers/admin-action/shiftAction";

export function useHandleShifts(data) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [selectedIds, setSelectedIds] = useState([]);
    const [search, setSearch] = useState("");
    const [sortFilter, setSortFilter] = useState("A-Z");
    const [shiftFilter, setShiftFilter] = useState("ALL");

    const filteredData = useMemo(() => {
        let result = data;

        if (search) {
            const q = search.toLowerCase();
            result = result.filter((s) =>
                s.name.toLowerCase().includes(q)
            );
        }

        if (shiftFilter !== "ALL") { result = result.filter((s) => s.type === shiftFilter); }

        const sorted = [...result];

        if (sortFilter === "A-Z") { sorted.sort((a, b) => a.name.localeCompare(b.name)) }
        if (sortFilter === "Z-A") { sorted.sort((a, b) => b.name.localeCompare(a.name)) }

        return sorted;
    }, [data, search, shiftFilter, sortFilter]);

    const toggleSelect = useCallback((id) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    }, []);

    const selectAll = useCallback(
        (checked) => {
            setSelectedIds(
                checked ? filteredData.map((s) => s.id) : []
            );
        },
        [filteredData]
    );

    const isAllSelected = filteredData.length > 0 && selectedIds.length === filteredData.length;

    const handleEditShift = useCallback(
        async (id) => {
            router.push(`/admin/dashboard/shifts/${id}/edit`);
        }, [router]
    );

    const handleDeleteShift = useCallback((id) => {
        startTransition(async () => {
            await deleteShiftById(id);
            router.refresh();
        });
    }, [router]);

    const deleteSelected = useCallback(() => {
        startTransition(async () => {
            await deleteShifts(selectedIds);
            setSelectedIds([]);
            router.refresh();
        });
    }, [selectedIds, router]);

    const deleteAll = useCallback(() => {
        startTransition(async () => {
            await deleteShifts(
                filteredData.map((s) => s.id)
            );
            setSelectedIds([]);
            router.refresh();
        });
    }, [filteredData, router]);

    return {
        search, setSearch,
        sortFilter, setSortFilter,
        shiftFilter, setShiftFilter,
        selectedIds, filteredData,
        isAllSelected,
        isPending,

        toggleSelect, selectAll,
        deleteSelected, deleteAll,
        handleEditShift, handleDeleteShift,
    };
}

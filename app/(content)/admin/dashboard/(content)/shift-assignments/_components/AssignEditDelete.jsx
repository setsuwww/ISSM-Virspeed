"use client";

import React, { memo } from "react";
import { SquarePen, SquarePlus, Trash2 } from "lucide-react";
import { Button } from "@/_components/ui/Button";

const AssignEditDelete = ({
    isSelectMode,
    onSelectAll,
    onBulkEdit,
    onBulkAssign,
    onBulkDelete,
    filledCount = 0,
    emptyCount = 0,
    loading = false,
}) => {
    if (!isSelectMode) return null;

    return (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">

            <Button
                variant="ghost"
                size="sm"
                onClick={onSelectAll}
                className="h-9 text-slate-600 hover:bg-slate-100"
            >
                Select All
            </Button>

            <div className="h-7 w-px bg-slate-300 mx-1" />

            <Button
                variant="outline"
                size="sm"
                onClick={onBulkEdit}
                disabled={filledCount === 0 || loading}
                className={`h-9 gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 ${filledCount === 0
                    ? ""
                    : "bg-slate-50 text-amber-600 hover:text-amber-800"
                    }`}
            >
                <SquarePen className="w-4 h-4" />
                Edit ({filledCount})
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={onBulkAssign}
                disabled={emptyCount === 0 || loading}
                className={`h-9 gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 ${emptyCount === 0
                    ? ""
                    : "bg-slate-50 text-blue-600 hover:text-blue-800"
                    }`}
            >
                <SquarePlus className="w-4 h-4" />
                Assign ({emptyCount})
            </Button>

            <Button
                variant="destructive"
                size="sm"
                onClick={onBulkDelete}
                disabled={filledCount === 0 || loading}
                className="h-9 gap-2"
            >
                <Trash2 className="w-4 h-4" />
                Delete
            </Button>
        </div>
    );
};

export default memo(AssignEditDelete);

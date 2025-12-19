"use client";

import { Trash2, FolderInput, Filter } from "lucide-react";

import { Input } from "@/_components/ui/Input";
import { Button } from "@/_components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/_components/ui/Dropdown-menu";

import { exportPDF } from "@/_function/exports/user/exportPDF";
import { exportWord } from "@/_function/exports/user/exportWord";
import { exportExcel } from "@/_function/exports/user/exportExcel";

export default function HistoryActionHeader({
  search,
  onSearchChange,

  selectedCount,
  onRemoveSelected,
  onRemoveAll,

  filteredData,
  searchInputRef,
}) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap mb-4">

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-64">
          <Filter
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            ref={searchInputRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="dd-MMMM-yyyy"
            className="pl-9 py-2 text-sm" typeSearch
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-rose-500"
          disabled={selectedCount === 0}
          onClick={onRemoveSelected}
        >
          Delete Selected
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="bg-rose-50/70 hover:bg-rose-100 text-rose-500"
          onClick={onRemoveAll}
        >
          <Trash2 size={18} /> Delete All
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="bg-lime-100/50 hover:bg-lime-100 text-lime-600"
            >
              <FolderInput size={16} /> Export
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Export As :</DropdownMenuLabel>

            <DropdownMenuItem onClick={() => exportPDF(filteredData)}>
              PDF
            </DropdownMenuItem>

            {/* <DropdownMenuItem onClick={() => exportWord(filteredData)}>
              Word (.docx)
            </DropdownMenuItem> */}

            <DropdownMenuItem onClick={() => exportExcel(filteredData)}>
              Excel (.xlsx)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </div>
  );
}

"use client";

import { FolderInput } from "lucide-react";
import { Button } from "@/_components/ui/Button";
import { Input } from "@/_components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/_components/ui/Dropdown-menu";

import React from "react";

export const AttendancesActionHeader = React.memo(({
  selectedDate, onDateChange,
  shiftFilter, onShiftFilterChange,
  dateSortOrder, onDateSortChange,

  filteredData,

  onExportPDF,
  onExportExcel,
  onExportWord,
}) => {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">

      <div className="flex items-center gap-3 flex-wrap">

        <Input type="date" value={selectedDate} onChange={(e) => onDateChange(e.target.value)}
          className="w-auto px-3 py-2" typeSearch={true}
        />

        <Select value={shiftFilter} onValueChange={onShiftFilterChange}>
          <SelectTrigger className="w-auto px-3 whitespace-nowrap">
            <span className="font-semibold text-slate-600 mr-1">Shift:</span>
            <SelectValue placeholder="All" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="MORNING">Morning</SelectItem>
            <SelectItem value="AFTERNOON">Afternoon</SelectItem>
            <SelectItem value="EVENING">Evening</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateSortOrder} onValueChange={onDateSortChange}>
          <SelectTrigger className="w-auto px-3 whitespace-nowrap">
            <span className="font-semibold text-slate-600 mr-1">Sort:</span>
            <SelectValue placeholder="Newest" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="desc">Newest</SelectItem>
            <SelectItem value="asc">Oldest</SelectItem>
          </SelectContent>
        </Select>

      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-teal-500 rounded-md hover:bg-teal-700">
              <FolderInput size={16} />
              Export
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Export As</DropdownMenuLabel>

            <DropdownMenuItem onClick={() => onExportPDF(filteredData)}>
              PDF
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onExportWord(filteredData)}>
              Word (.docx)
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onExportExcel(filteredData)}>
              Excel (.xlsx)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </div>
  );
});

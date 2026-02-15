"use client"

import React from "react";
import { FolderInput } from "lucide-react";
import { Button } from "@/_components/ui/Button";
import { Input } from "@/_components/ui/Input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/_components/ui/Select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/_components/ui/Dropdown-menu";

import { exportPDF } from "@/_functions/exports/attendance/exportPDF";
import { exportWord } from "@/_functions/exports/attendance/exportWord";
import { exportExcel } from "@/_functions/exports/attendance/exportExcel";

export const AttendancesActionHeader = React.memo(({
  selectedDate, onDateChange,
  filterShift, onFilterShiftChange,
  dateSortOrder, onDateSortChange,

  filteredData,
}) => {

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap pb-1">

      <div className="flex items-center gap-3 flex-wrap">

        <Input type="date" typeSearch
          value={selectedDate} onChange={(e) => onDateChange(e.target.value)}
          className="w-auto px-3 py-2"
        />

        <Select value={filterShift} onValueChange={onFilterShiftChange}>
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
            <Button className="bg-lime-500 rounded-md hover:bg-lime-700">
              <FolderInput size={16} />
              Export
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Export As :</DropdownMenuLabel>

            <DropdownMenuItem className="focus:text-red-500" onClick={() => exportPDF(filteredData)}>
              PDF
            </DropdownMenuItem>

            <DropdownMenuItem className="focus:text-blue-500" onClick={() => exportWord(filteredData)}>
              Word (.docx)
            </DropdownMenuItem>

            <DropdownMenuItem className="focus:text-green-500" onClick={() => exportExcel(filteredData)}>
              Excel (.xlsx)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </div>
  );
});

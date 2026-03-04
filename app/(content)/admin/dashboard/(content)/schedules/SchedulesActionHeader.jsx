"use client";

import { FolderInput, Trash2 } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/_components/ui/Dropdown-menu"

import { Button } from "@/_components/ui/Button";
import { Input } from "@/_components/ui/Input";

import { exportPDF } from "@/_functions/exports/schedule/exportPDF";
import { exportWord } from "@/_functions/exports/schedule/exportWord";
import { exportExcel } from "@/_functions/exports/schedule/exportExcel";

export default function SchedulesActionHeader({
  search, setSearch,
  selectedCount,
  onDeleteSelected, onDeleteAll,
  filterFrequency, onFilterFrequencyChange, filteredData
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2">
      <div className="flex items-center gap-2 w-full">
        <Select value={filterFrequency} onValueChange={onFilterFrequencyChange} defaultValue="all">
          <SelectTrigger className="w-auto px-3 whitespace-nowrap">
            <span className="font-semibold text-slate-600 mr-1">Frequency:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="DAILY">Daily</SelectItem>
            <SelectItem value="WEEKLY">Weekly</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="YEARLY">Yearly</SelectItem>
            <SelectItem value="ONCE">Once</SelectItem>
          </SelectContent>
        </Select>

        <Input value={search} onChange={(e) => setSearch(e.target.value)} className="min-w-[180px] max-w-[250px] w-auto"
          placeholder="Search schedules..." typeSearch
        />
      </div>

      <div className="flex items-center gap-x-2">
        <Button variant="ghost" size="sm" className="text-rose-500"
          onClick={onDeleteSelected}
          disabled={selectedCount === 0}
        >
          Delete Selected
        </Button>

        <Button variant="ghost" size="sm" className="bg-rose-50/70 hover:bg-rose-100 text-rose-500"
          onClick={onDeleteAll}
        >
          <Trash2 size={16} /> Delete All
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="bg-lime-100/50 hover:bg-lime-100 text-lime-600">
              <FolderInput size={16} />Export
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
}

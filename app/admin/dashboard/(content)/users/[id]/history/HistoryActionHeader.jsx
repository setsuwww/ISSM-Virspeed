"use client";

import { Filter, FolderInput, Trash2 } from "lucide-react";

import { Input } from "@/_components/ui/Input";
import { Button } from "@/_components/ui/Button";
import { ButtonGroup } from "@/_components/ui/Button-group";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/_components/ui/Dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select";

import { exportPDF } from "@/_function/exports/employee/history/exportPDF";
import { exportWord } from "@/_function/exports/employee/history/exportWord";
import { exportExcel } from "@/_function/exports/employee/history/exportExcel";

export default function HistoryActionHeader({
  search, onSearchChange,
  status, onStatusChange,
  sort, onSortChange,

  filteredData, selectedCount,
  onRemoveSelected, onRemoveAll,
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <ButtonGroup>
          <Button size="sm" variant="outline">1 Week</Button>
          <Button size="sm" variant="outline">1 Month</Button>
          <Button size="sm" variant="outline">1 Year</Button>
        </ButtonGroup>

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger size="sm" className="w-auto">
            <span className="font-semibold text-slate-600 mr-1">Status:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="PRESENT">Present</SelectItem>
            <SelectItem value="LATE">Late</SelectItem>
            <SelectItem value="PERMISSION">Permission</SelectItem>
            <SelectItem value="ABSENT">Absent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger size="sm" className="w-auto">
            <span className="font-semibold text-slate-600 mr-1">Sort:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest</SelectItem>
            <SelectItem value="asc">Oldest</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            size="sm"
            className="pl-9"
            placeholder="Search date..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="text-rose-500"
          disabled={selectedCount === 0}
          onClick={onRemoveSelected}
        >
          Delete Selected
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="bg-rose-50/70 hover:bg-rose-100 text-rose-500"
          onClick={onRemoveAll}
        >
          <Trash2 size={16} />
          Delete All
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="bg-lime-100/50 hover:bg-lime-100 text-lime-600">
              <FolderInput size={16} />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Export As</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => exportPDF(filteredData)}>PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportWord(filteredData)}>Word</DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportExcel(filteredData)}>Excel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

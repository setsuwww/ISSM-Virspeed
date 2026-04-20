import React from 'react'

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/_components/ui/Dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select";
import { Input } from "@/_components/ui/Input";
import { Button } from "@/_components/ui/Button";
import { Trash2, FolderInput } from "lucide-react";

import { exportPDF } from "@/_functions/exports/user/exportPDF";
import { exportWord } from "@/_functions/exports/user/exportWord";
import { exportExcel } from "@/_functions/exports/user/exportExcel";

export default function ListUsersActionHeader({
  sortOrder, onSortOrderChange,
  search, onSearchChange,
  selectedCount,
  onDeleteSelected, onDeleteAll,
  filteredData
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 pb-2">
      <div className="flex items-center gap-2">
        <Select value={sortOrder} onValueChange={onSortOrderChange}>
          <SelectTrigger className="w-auto px-3">
            <span className="font-semibold text-slate-600 mr-1">Filter:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A-Z">A - Z</SelectItem>
            <SelectItem value="Z-A">Z - A</SelectItem>
          </SelectContent>
        </Select>

        <Input placeholder="Search employee..."
          value={search} onChange={(e) => onSearchChange(e.target.value)}
          typeSearch
        />
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" className="text-red-500"
          disabled={!selectedCount} onClick={onDeleteSelected}
        >
          Delete Selected
        </Button>

        <Button size="sm" variant="ghost" className="bg-red-50 text-red-500 hover:bg-red-100"
          onClick={onDeleteAll}
        >
          <Trash2 size={18} />
          Delete All
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

            <DropdownMenuItem className="focus:text-emerald-500" onClick={() => exportExcel(filteredData)}>
              Excel (.xlsx)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

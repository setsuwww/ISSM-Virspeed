import { Trash2, FolderInput } from "lucide-react";
import { Input } from "@/_components/ui/Input";
import { Button } from "@/_components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/_components/ui/Dropdown-menu"

import { exportPDF } from "@/_function/exports/user/exportPDF";
import { exportWord } from "@/_function/exports/user/exportWord";
import { exportExcel } from "@/_function/exports/user/exportExcel";

export default function ShiftsActionHeader({
  search, onSearchChange,
  shiftFilter, onShiftFilterChange,
  sortFilter, onSortFilterChange,
  selectedCount, onDeleteSelected, onDeleteAll,
  filteredData, searchInputRef,
}) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap pb-2">

      <div className="flex items-center gap-2">
        <Select value={sortFilter} onValueChange={onSortFilterChange}>
          <SelectTrigger className="w-auto px-3 whitespace-nowrap">
            <span className="font-semibold text-slate-600 mr-1">Filter:</span>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>

            <SelectItem value="A-Z">A - Z</SelectItem>
            <SelectItem value="Z-A">Z - A</SelectItem>
          </SelectContent>
        </Select>

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

        <Input ref={searchInputRef} value={search} onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search shifts..." className="w-full sm:w-64 py-2" typeSearch
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-rose-500"
          onClick={onDeleteSelected} disabled={selectedCount === 0}
        >
          Delete Selected
        </Button>

        <Button variant="ghost" size="sm" className="bg-rose-50/70 hover:bg-rose-100 text-rose-500"
          onClick={onDeleteAll}
        >
          <Trash2 size={18} strokeWidth={2} />Delete All
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

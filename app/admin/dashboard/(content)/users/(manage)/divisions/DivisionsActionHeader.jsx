import { Trash2, FolderInput } from "lucide-react"
import { Input } from "@/_components/ui/Input"
import { Button } from "@/_components/ui/Button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/_components/ui/Dropdown-menu"

import { exportPDF } from "@/_functions/exports/division/exportPDF"
import { exportWord } from "@/_functions/exports/division/exportWord"
import { exportExcel } from "@/_functions/exports/division/exportExcel"

export default function DivisionsActionHeader({
  search, onSearchChange,
  typeFilter, onTypeFilterChange,
  statusFilter, onStatusFilterChange,
  selectedCount, onDeleteSelected,
  onDeleteAll,
  filteredData,
  searchInputRef,
}) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap pb-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-auto px-3 whitespace-nowrap">
            <span className="font-semibold text-slate-600 mr-1">Type:</span>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="WFO">WFO</SelectItem>
            <SelectItem value="WFA">WFA</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-auto px-3 whitespace-nowrap">
            <span className="font-semibold text-slate-600 mr-1">Status:</span>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Input ref={searchInputRef} value={search} onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search division..." className="w-full sm:w-64 py-2" typeSearch
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" className="text-rose-500" onClick={onDeleteSelected}
          disabled={selectedCount === 0}
        >
          Delete Selected
        </Button>

        <Button variant="ghost" size="sm" className="bg-rose-50/70 hover:bg-rose-100 text-rose-500"
          onClick={onDeleteAll}
        >
          <Trash2 size={18} strokeWidth={2} />
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

            <DropdownMenuItem className="focus:text-green-500" onClick={() => exportExcel(filteredData)}>
              Excel (.xlsx)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

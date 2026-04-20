"use client"

import { Button } from "@/_components/ui/Button"
import { Input } from "@/_components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select"
import { ArrowDownUp, ArrowUpDown, ChevronRight } from "lucide-react"

export default function HistoryActionHeader({
  order, onToggleOrder,
  statusFilter, onStatusFilterChange,
  search, onSearchChange,
  searchInputRef,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 pb-2 justify-between">
      <div className="flex items-center space-x-2">
        <Button variant="outline" onClick={onToggleOrder} className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Sort:</span> <span className="text-slate-500">{order === "asc" ? "Oldest" : "Newest"}</span>
          {order === "asc" ? <ArrowUpDown className="w-3 h-3 text-slate-400" /> : <ArrowDownUp className="w-3 h-3 text-slate-400" />}
        </Button>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-auto px-3 whitespace-nowrap">
            <span className="font-semibold text-slate-600 mr-1">Status:</span>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="PRESENT">Present</SelectItem>
            <SelectItem value="ABSENT">Absent</SelectItem>
            <SelectItem value="PERMISSION">Permission</SelectItem>
            <SelectItem value="LATE">Late</SelectItem>
          </SelectContent>
        </Select>

        <Input ref={searchInputRef} value={search} onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search date..." className="w-full sm:w-64" typeSearch
        />
      </div>
    </div>
  )
}

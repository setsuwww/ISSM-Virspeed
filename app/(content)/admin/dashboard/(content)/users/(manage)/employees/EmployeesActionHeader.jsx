"use client"

import React, { useState } from "react"
import { FolderInput, Trash2, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/_lib/utils"

import { Badge } from "@/_components/ui/Badge"
import { Input } from "@/_components/ui/Input"
import { Button } from "@/_components/ui/Button"
import { Popover, PopoverTrigger, PopoverContent } from "@/_components/ui/Popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/_components/ui/Command"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from "@/_components/ui/Dropdown-menu"

import { locationStyles } from "@/_constants/theme/locationTheme";

import { exportPDF } from "@/_functions/exports/employee/exportPDF";
import { exportWord } from "@/_functions/exports/employee/exportWord";
import { exportExcel } from "@/_functions/exports/employee/exportExcel";

export const EmployeesActionHeader = React.memo(function EmployeesActionHeader({
  mode = "default",
  search, setSearch,
  selected = [], onDeleteSelected, onDeleteAll,
  locationFilter, setLocationFilter,
  filteredData = [],
  shiftFilter, onShiftFilterChange,
  locations = [],
}) {
  const [locationQuery, setLocationQuery] = useState("")
  const [openLocation, setOpenLocation] = useState(false)
  const [statusFilter, setStatusFilter] = useState([])

  const selectedLocation = locationFilter === "all" ? "All" : locations.find((d) => String(d.id) === locationFilter)?.name ?? "Select Location"

  const toggleStatus = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const isWorkHours = mode === "work-hours"
  const showShift = !isWorkHours

  const filteredLocations = locations.filter((d) => {
    const matchStatus =
      statusFilter.length === 0 || statusFilter.includes(d.type)

    const matchQuery =
      locationQuery === "" ||
      d.name.toLowerCase().includes(locationQuery.toLowerCase())

    return matchStatus && matchQuery
  })

  return (
    <div className="flex flex-wrap justify-between items-center gap-2 pb-2">
      <div className="flex items-center gap-2 w-full md:w-2/3">
        {showShift && (
          <Select value={shiftFilter} onValueChange={onShiftFilterChange}>
            <SelectTrigger className="w-auto px-3 whitespace-nowrap">
              <span className="font-semibold text-slate-600 mr-1">Shift:</span>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="MORNING">Morning</SelectItem>
              <SelectItem value="AFTERNOON">Afternoon</SelectItem>
              <SelectItem value="EVENING">Evening</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Popover open={openLocation} onOpenChange={setOpenLocation}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openLocation}
              className="group w-fit flex items-center justify-between rounded-md hover:bg-transparent border-slate-300 shadow-[0_0.5px_1px_rgba(0,0,0,0.20)]"
            >
              <div className="flex items-center text-slate-500">
                <span className="font-semibold text-slate-600 mr-2">Location:</span>
                <span className="text-slate-400">{selectedLocation}</span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:scale-125 transition" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-80" side="bottom" align="start" sideOffset={4}>
            <Command>
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-200">
                <CommandInput placeholder="Search location..." withBorder={false} value={locationQuery} onValueChange={setLocationQuery} />
                <div className="flex gap-1">
                  {["WFO", "WFA"].map((type) => (
                    <Badge key={type} onClick={() => toggleStatus(type)} variant={statusFilter.includes(type) ? "secondary" : "outline"}
                      className={cn("cursor-pointer text-xs select-none text-slate-500",
                        statusFilter.includes(type) && locationStyles[type]
                      )}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <CommandList>
                <CommandEmpty>No location found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem value="all" onSelect={() => {
                    setLocationFilter("all")
                    setLocationQuery("")
                    setOpenLocation(false)
                  }}
                  >
                    All
                    <Check className={cn("mr-2 h-4 w-4", locationFilter === "all" ? "opacity-100" : "opacity-0")} />
                  </CommandItem>

                  {filteredLocations.map((d) => (
                    <CommandItem
                      key={d.id}
                      value={d.name}
                      onSelect={() => {
                        setLocationFilter(String(d.id))
                        setOpenLocation(false)
                        setLocationQuery("")
                      }}
                    >
                      {d.name}
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          locationFilter === String(d.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-1/3 min-w-40" typeSearch
        />
      </div>

      <div className="flex items-center gap-x-2">
        <Button variant="ghost" size="sm" className="text-rose-500" onClick={onDeleteSelected} disabled={!selected.length}>
          Delete Selected
        </Button>
        <Button variant="ghost" size="sm" className="bg-rose-50/70 text-rose-500 hover:bg-rose-100" onClick={onDeleteAll}>
          <Trash2 className="w-4 h-4" /> Delete All
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
})

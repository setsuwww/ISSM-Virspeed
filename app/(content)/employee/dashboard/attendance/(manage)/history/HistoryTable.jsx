"use client"

import { useState, useMemo, useRef } from "react"
import { CalendarDays, Clock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table"
import { Badge } from "@/_components/ui/Badge"

import HistoryActionHeader from "./HistoryActionHeader"
import { attendancesStyles } from "@/_components/_constants/theme/attendanceTheme"
import { shiftDots, shiftStyles } from "@/_components/_constants/shiftConstants"
import { cn } from "@/_lib/utils"
import { capitalize } from "@/_functions/globalFunction"

export default function HistoryTable({ data, initialOrder = "desc" }) {
  const [order, setOrder] = useState(initialOrder)
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")
  const searchInputRef = useRef(null)

  const filteredSortedData = useMemo(() => {
    return data
      .filter(att => statusFilter === "all" ? true : att.status === statusFilter)
      .filter(att => search ? att.dateLabel.toLowerCase().includes(search.toLowerCase()) : true)
      .sort((a, b) => order === "asc" ? a.dateValue - b.dateValue : b.dateValue - a.dateValue)
  }, [data, order, statusFilter, search])

  return (
    <div className="space-y-3">
      <HistoryActionHeader
        order={order}
        onToggleOrder={() =>
          setOrder(o => (o === "asc" ? "desc" : "asc"))
        }
        statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
        search={search} onSearchChange={setSearch}
        searchInputRef={searchInputRef}
      />

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Shift</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Checkin / Checkout</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredSortedData.map(att => (
            <TableRow
              key={att.id}
              className={cn(
                att.isToday && "ring-2 ring-blue-500 ring-inset"
              )}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-200 p-2 rounded-full">
                    <CalendarDays className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{att.dateLabel}</p>
                    <p className="text-xs text-slate-400">
                      {att.dateFull}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center space-x-3">
                  {shiftDots[att.shiftType]}

                  <div className="flex flex-col text-sm text-slate-600">
                    <p className="font-semibold">
                      {capitalize(att.shiftType)}
                    </p>

                    <p className="text-xs text-slate-400">
                      {att.shiftStartTime} - {att.shiftEndTime}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className={`text-md capitalize !p-0 !bg-transparent !border-none ${attendancesStyles[att.status.replace("_", " ")]}`}
                    >
                      {att.status.replace("_", " ")}
                    </Badge>

                    {att.approval && (
                      <Badge className={`text-md capitalize !p-0 !bg-transparent ${attendancesStyles[att.approval.replace("_", " ")]}`}>
                        {att.approval.replace("_", " ")}
                      </Badge>
                    )}
                  </div>

                  {(att.checkInStatus || att.checkOutStatus) && (
                    <div className="flex flex-col text-[10px] tracking-tight capitalize font-semibold text-slate-400/80 leading-none space-y-1">
                      {att.checkInStatus && (
                        <div>Check-in : <span className={`!p-0 !bg-transparent !border-none tracking-wider ${attendancesStyles[att.checkInStatus.replace('_', ' ')]}`}>{att.checkInStatus.replace('_', ' ')}</span></div>
                      )}
                      {att.checkOutStatus && (
                        <div>Check-out : <span className={`!p-0 !bg-transparent !border-none tracking-wider ${attendancesStyles[att.checkOutStatus]}`}> {att.checkOutStatus.replace('_', ' ')}</span></div>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <p className="text-sm">{att.reason}</p>
                {att.adminNote && (
                  <p className="text-xs text-slate-400">
                    Note: {att.adminNote}
                  </p>
                )}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-x-3 p-2">
                  <div className="bg-gray-100 text-yellow-500 p-2 rounded-full">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-sm font-medium">
                    <span className="text-gray-600">
                      Checkin: <span className="text-emerald-600">{att.checkInTime ?? "00:00"}</span>
                    </span>
                    <span className="text-gray-600">
                      Checkout: <span className="text-red-600">{att.checkOutTime ?? "00:00"}</span>
                    </span>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

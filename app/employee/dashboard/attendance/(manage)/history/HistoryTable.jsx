"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table"
import { Badge } from "@/_components/ui/Badge"
import { Button } from "@/_components/ui/Button"
import { ArrowUpDown, ArrowDownUp, CalendarDays } from "lucide-react"

import { attedancesStyles } from "@/_constants/attendanceConstants"
import { shiftDots, shiftStyles } from "@/_constants/shiftConstants"
import { capitalize } from "@/_function/globalFunction"

export default function HistoryTable({ data, initialOrder }) {
  const [order, setOrder] = useState(initialOrder)

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) =>
      order === "asc"
        ? a.dateValue - b.dateValue
        : b.dateValue - a.dateValue
    )
  }, [data, order])

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOrder(o => (o === "asc" ? "desc" : "asc"))}
        className="flex items-center gap-2"
      >
        {order === "asc"
          ? <ArrowUpDown className="w-4 h-4" />
          : <ArrowDownUp className="w-4 h-4" />}
        Sort by date
      </Button>

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
          {sortedData.map(att => (
            <TableRow key={att.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-200 p-2 rounded-full">
                    <CalendarDays className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{att.dateLabel}</p>
                    <p className="text-xs text-slate-400">{att.dateFull}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center">
                  <Badge className={`flex items-center gap-x-2 !bg-white !border-slate-200 ${shiftStyles[att.shiftType]}`}>
                    {shiftDots[att.shiftType]}
                    <span>{capitalize(att.shiftType)}</span>
                  </Badge>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex gap-2">
                  <Badge variant="outline" className={`${attedancesStyles[att.status]}`}>
                    {att.status}
                  </Badge>

                  {att.approval && (
                    <Badge className={attedancesStyles[att.approval]}>
                      {att.approval}
                    </Badge>
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
                <div className="flex flex-col text-sm font-medium">
                  <span className="text-teal-600">
                    Checkin: {att.checkInTime ?? "—"}
                  </span>
                  <span className="text-rose-600">
                    Checkout: {att.checkOutTime ?? "—"}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

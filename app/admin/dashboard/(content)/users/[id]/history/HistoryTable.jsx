"use client"

import { Badge } from "@/_components/ui/Badge"
import { Checkbox } from "@/_components/ui/Checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table"
import { attedancesStyles } from "@/_constants/attendanceConstants"
import { shiftDots } from "@/_constants/shiftConstants"

import { capitalize } from "@/_function/globalFunction"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Clock, ClipboardClock } from "lucide-react"

export default function UserHistoryTable({ history }) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">
              <Checkbox />
            </TableHead>
            <TableHead className="text-left">Date</TableHead>
            <TableHead className="text-left">Shift</TableHead>
            <TableHead className="text-left">Check In</TableHead>
            <TableHead className="text-left">Check Out</TableHead>
            <TableHead className="text-left">Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {history.map((h) => (
            <TableRow key={h.id}>
              <TableCell>
                <Checkbox />
              </TableCell>

              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="bg-slate-200 p-2 rounded-full">
                    <ClipboardClock className="h-5 w-5 text-slate-600" strokeWidth={1} />
                  </div>
                  <span className="flex flex-col leading-tight">
                    <span className="font-semibold text-slate-600">
                      {format(new Date(h.date), "EEEE")}
                    </span>
                    <span className="text-sm text-slate-400">
                      {format(new Date(h.date), "dd MMMM yyyy")}
                    </span>
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center space-x-3">
                  {shiftDots[h.shift?.type]}
                  <span className="flex flex-col items-start">
                    <span className="bg-transparent text-sm font-semibold text-slate-600">
                      {capitalize(h.shift?.type) ?? "-"}
                    </span>
                    <div className="flex items-center gap-x-2 text-xs text-slate-400">
                      <span>{h.shift?.startTime ?? "-"}</span>
                      <span>-</span>
                      <span>{h.shift?.endTime ?? "-"}</span>
                    </div>
                  </span>
                </div>
              </TableCell>

              <TableCell>
                {h.checkInTime ? (
                  <div className="flex items-center gap-1.5 text-teal-600">
                    <div className="bg-teal-500/10 p-2 rounded-full">
                      <Clock className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <span className="font-medium">
                      {format(new Date(h.checkInTime), "HH:mm", { locale: id })}
                    </span>
                    <span className="uppercase">
                      {format(new Date(h.checkInTime), "a")}
                    </span>
                  </div>
                ) : ("-")}
              </TableCell>

              <TableCell>
                {h.checkOutTime ? (
                  <div className="flex items-center gap-1.5 text-rose-600">
                    <Clock className="h-4 w-4" strokeWidth={1.5} />
                    <span className="font-medium">
                      {format(new Date(h.checkOutTime), "HH:mm", { locale: id })}
                    </span>
                    <span className="uppercase">
                      {format(new Date(h.checkOutTime), "a")}
                    </span>
                  </div>
                ) : ("-")}
              </TableCell>

              <TableCell>
                <Badge className={attedancesStyles[capitalize(h.status)]}>
                  {capitalize(h.status)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

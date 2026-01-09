"use client"

import { CalendarDays } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table"
import { Badge } from "@/_components/ui/Badge"

import { attendancesStyles, normalizeRequestStatus, getDisplayStatus } from "@/_constants/attendanceConstants"

export default function LeaveTable({ data }) {
  return (
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Leave Type</TableHead>
          <TableHead>Leave Period</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map(item => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="bg-slate-200 p-2 rounded-full">
                  <CalendarDays className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold">{item.dateLabel}</p>
                  <p className="text-xs text-slate-400">{item.dateFull}</p>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <Badge variant="outline">
                {item.typeLabel}
              </Badge>
            </TableCell>

            <TableCell>
              <div className="flex flex-col text-sm font-medium">
                <span className="text-green-600">
                  {item.startDate}
                </span>
                <span className="text-red-600">
                  {item.endDate}
                </span>
              </div>
            </TableCell>

            <TableCell>
              <p className="text-sm">{item.reason || "—"}</p>
              {item.adminReason && (
                <p className="text-xs text-slate-400 mt-1">
                  Admin: {item.adminReason}
                </p>
              )}
            </TableCell>

            <TableCell>
              <Badge
                className={
                  attendancesStyles[
                    normalizeRequestStatus(item.status)
                  ]
                }
              >
                {getDisplayStatus(item.status)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

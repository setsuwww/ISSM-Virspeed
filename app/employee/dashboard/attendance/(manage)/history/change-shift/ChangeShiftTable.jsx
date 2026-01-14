"use client"

import { CalendarDays, CircleUserRound } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table"
import { Badge } from "@/_components/ui/Badge"

import { shiftStyles } from "@/_constants/shiftConstants"
import {
  attendancesStyles,
  normalizeRequestStatus,
  getDisplayStatus,
} from "@/_constants/attendanceConstants"

export default function ChangeShiftTable({ data = [] }) {
  if (!data.length) {
    return (
      <div className="py-12 text-center text-slate-400">
        No change shift history found
      </div>
    )
  }

  return (
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Target</TableHead>
          <TableHead>Shift Change</TableHead>
          <TableHead>Period</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map(item => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-slate-200 p-2">
                  <CalendarDays className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold">{item.dateLabel}</p>
                  <p className="text-xs text-slate-400">
                    {item.dateFull}
                  </p>
                </div>
              </div>
            </TableCell>

            <TableCell>
              {item.targetUserName ? (
                <div className="flex items-center gap-3 py-2">
                  <div className="rounded-full bg-slate-200 p-2">
                    <CircleUserRound
                      className="h-5 w-5 text-slate-600"
                      strokeWidth={1}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">
                      {item.targetUserName}
                    </p>
                    {item.targetUserEmail && (
                      <p className="text-xs text-slate-400">
                        {item.targetUserEmail}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-slate-400">Self</span>
              )}
            </TableCell>

            <TableCell>
              <div className="flex flex-col gap-1 text-sm font-medium">
                <span>
                  From{" "}
                  {item.oldShift ? (
                    <Badge
                      variant="outline"
                      className={shiftStyles[item.oldShift.type]}
                    >
                      {item.oldShift.name}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </span>

                <span>
                  To{" "}
                  {item.newShift ? (
                    <Badge
                      variant="outline"
                      className={shiftStyles[item.newShift.type]}
                    >
                      {item.newShift.name}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </span>
              </div>
            </TableCell>

            <TableCell>
              <div className="flex flex-col text-sm">
                <span className="text-green-600">
                  {item.startDate}
                </span>
                <span className="text-red-600">
                  {item.endDate}
                </span>
              </div>
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

"use client"

import { useState, useEffect, useTransition, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { CalendarFold, CircleUserRound, Loader, ChevronDown, ClockFading, ChevronRight } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table"
import { Badge } from "@/_components/ui/Badge"
import EmptyStates from "@/_components/common/EmptyStates"
import { ContentInformation } from "@/_components/common/ContentInformation"
import { AttendancesActionHeader } from "./AttendancesActionHeader"

import { shiftStyles } from "@/_constants/shiftConstants"
import { attendancesStyles } from "@/_constants/theme/attendanceTheme"

import { safeFormat, capitalize, wordsLimit } from "@/_functions/globalFunction"
import { getAttendancesByDate } from "@/_servers/admin-action/attendance_action"
import Link from "next/link"
import { formatWorkHours } from "@/_functions/helpers/attendanceHelpers"

export default function AttendancesTableClient({ initialPage = 1 }) {
  const searchParams = useSearchParams()
  const page = Number(searchParams.get("page")) || 1
  const [totalPages, setTotalPages] = useState(1)
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])

  const [sortOrder, setSortOrder] = useState("desc")
  const [filterShift, setFilterShift] = useState("ALL")

  const [data, setData] = useState([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const result = await getAttendancesByDate(date, page)
      setData(result.data)
      setTotalPages(result.totalPages)
    })
  }, [date, page])

  const filteredData = useMemo(() => {
    return data.filter(att => {
      if (filterShift === "ALL") return true
      return att.shift?.type === filterShift
    })
  }, [data, filterShift])

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aDate = new Date(a.date)
      const bDate = new Date(b.date)
      return sortOrder === "asc" ? aDate - bDate : bDate - aDate
    })
  }, [filteredData, sortOrder])

  return (
    <>
      <div className="flex flex-wrap items-center justify-between my-6 gap-4">
        <ContentInformation title="List attendances" subtitle={`Manage and review all attendance ${safeFormat(date, "dd-MMMM-yyyy")}`} />

        <AttendancesActionHeader
          selectedDate={date} onDateChange={setDate}
          filterShift={filterShift} onFilterShiftChange={setFilterShift}
          dateSortOrder={sortOrder} onDateSortChange={setSortOrder}
          filteredData={sortedData}
        />
      </div>

      {isPending ? (
        <div className="flex items-center justify-center text-center py-6 text-slate-500">
          <Loader className="w-4 h-4 animate-spin mr-1" /> Loading...
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Check In - Check Out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map(att => (
                <TableRow key={att.id}>
                  <TableCell className="font-number text-slate-600 font-semibold tracking-wide">
                    <div className="flex items-center space-x-2">
                      <div className="bg-slate-200 p-1 rounded-full">
                        <CalendarFold className="h-4 w-4 text-slate-600" strokeWidth={1} />
                      </div>
                      <span>{safeFormat(att.date, "dd-MM-yyyy")}</span>
                      <Link href={`/admin/dashboard/users/${att.user?.id}/history`} className="bg-blue-100 hover:bg-blue-200/50 text-blue-500 hover:text-blue-700 p-1 rounded-full">
                        <ClockFading size={16} strokeWidth={2} />
                      </Link>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="icon-parent">
                        <CircleUserRound className="icon" strokeWidth={1} />
                      </div>

                      <div className="flex flex-col">
                        <span className="flex items-center text-sm text-slate-700 font-semibold">
                          {att.user?.name}
                          {att.shift ? (
                            <Badge className={`bg-transparent border-none ml-1 ${shiftStyles[att.shift.type]}`}>
                              {capitalize(att.shift.type)}
                            </Badge>
                          ) : "-"}
                        </span>

                        <span className="text-xs text-slate-400">{att.user?.email}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-number text-sm text-slate-600 tracking-tight">
                      <span className="bg-green-50 text-green-500">{safeFormat(att.checkInTime, "hh:mm a").toUpperCase()} </span>-{" "}
                      <span className="bg-red-50 text-red-500">{safeFormat(att.checkOutTime, "hh:mm a").toUpperCase()} </span>-{" "}
                      <span className="bg-slate-50 text-slate-500">{formatWorkHours(att.workHours)} </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={`${attendancesStyles[att.status]} bg-white border border-slate-300 shadow-xs text-sm px-2 py-0.5 rounded-sm`}>
                      {capitalize(att.status)}
                      {att.status === "PERMISSION" && att.approval === "PENDING" && (
                        <ChevronDown size={30} />
                      )}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center">
                      {wordsLimit(att.reason, 5)}
                      {att.status === "PERMISSION" && (
                        <Link href="/admin/dashboard/requests" className="ml-1">
                          <ChevronRight className="w-5 h-5 text-blue-500" />
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-slate-500">
                  <EmptyStates />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </>
  )
}

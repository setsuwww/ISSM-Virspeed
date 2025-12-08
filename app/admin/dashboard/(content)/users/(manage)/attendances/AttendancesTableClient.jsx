"use client"

import { CalendarFold, CircleUserRound } from "lucide-react"
import { useState, useEffect, useTransition } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table"
import { Badge } from "@/_components/ui/Badge"
import { shiftStyles } from "@/_constants/shiftConstants"
import { attedancesStyles } from "@/_constants/attendanceConstants"
import { safeFormat, capitalize } from "@/_function/globalFunction"
import { getAttendancesByDate } from "@/_server/admin-action/attendanceAction"
import EmptyStates from "@/_components/common/EmptyStates"
import { ContentInformation } from "@/_components/common/ContentInformation"
import { AttendancesActionHeader } from "./AttendancesActionHeader"

export default function AttendancesTableClient() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterShift, setFilterShift] = useState("ALL")
  const [data, setData] = useState([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const result = await getAttendancesByDate(date)
      setData(result)
    })
  }, [])

  const handleDateChange = (newDate) => {
    setDate(newDate)
    startTransition(async () => {
      const result = await getAttendancesByDate(newDate)
      setData(result)
    })
  }

  const filteredData = data.filter(att =>
    filterShift === "ALL" || (att.shift && att.shift.type === filterShift)
  )

  const sortedData = [...filteredData].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA
  })

  return (
    <>
      <div className="flex flex-wrap items-center justify-between my-6 gap-4">
        <ContentInformation heading="List Attendances" subheading="Manage and review all attendance records" />

        <AttendancesActionHeader
          date={date} onDateChange={handleDateChange}
          sortOrder={sortOrder} onSortOrderChange={setSortOrder}
          filterShift={filterShift} onFilterShiftChange={setFilterShift}

          onExportPDF={() => exportPDF(filteredData)}
          onExportWord={() => exportWord(filteredData)}
          onExportExcel={() => exportExcel(filteredData)}
        />
      </div>

      {isPending ? (<div className="text-center py-6 text-slate-500">Loading...</div>)
        : (
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
                sortedData.map((att) => (
                  <TableRow key={att.id}>
                    <TableCell className="font-number text-slate-600 font-semibold tracking-wide">
                      <div className="flex items-center space-x-2">
                        <div className="bg-slate-200 p-1 rounded-full">
                          <CalendarFold className="h-4 w-4 text-slate-600" strokeWidth={1} />
                        </div>
                        <span>{safeFormat(att.date, "dd-MM-yyyy")}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-200 p-2 rounded-full">
                          <CircleUserRound className="h-5 w-5 text-slate-600" strokeWidth={1} />
                        </div>
                        <div className="flex flex-col">
                          <span className="flex items-center text-sm text-slate-700 font-semibold">
                            {att.user?.name}
                            {att.shift ? (
                              <Badge className={`bg-transparent border-none ml-2 ${shiftStyles[att.shift.type] ?? "bg-gray-100 text-gray-700"}`}>
                                {capitalize(att.shift.type)}
                              </Badge>
                            ) : (<span className="text-sm text-gray-400">-</span>)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {att.user?.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-number flex items-center space-x-2 text-sm text-slate-600">
                        <span>{safeFormat(att.checkInTime, "hh:mm a").toUpperCase()} - {safeFormat(att.checkOutTime, "hh:mm a").toUpperCase()}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={`${attedancesStyles[capitalize(att.status)]} bg-white border border-slate-200 text-sm px-2 py-0.5 gap-2 rounded-sm `}>
                        {capitalize(att.status)}
                      </Badge>
                    </TableCell>

                    <TableCell>{att.reason ?? "-"}</TableCell>
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

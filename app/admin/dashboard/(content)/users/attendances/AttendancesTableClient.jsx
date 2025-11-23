"use client"

import { useState, useTransition, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table"
import { Badge } from "@/_components/ui/Badge"
import { Input } from "@/_components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select"
import { shiftStyles } from "@/_constants/shiftConstants"
import { attedancesStyles } from "@/_constants/attendanceConstants"
import { safeFormat, capitalize } from "@/_function/globalFunction"
import { ContentInformation } from "@/_components/content/ContentInformation"
import { getAttendancesByDate } from "@/_components/server/attendanceAction"
import { calculateWorkHours } from "@/_function/helpers/attendanceHelpers"
import EmptyStates from "@/_components/content/EmptyStates"

export default function AttendancesTableClient() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [sortOrder, setSortOrder] = useState("desc")
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

  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA
  })

  return (
    <>
      <div className="flex flex-wrap items-center justify-between my-6 gap-4">
        <ContentInformation heading="List Attendances" subheading="Manage and review all attendance records"/>

        <div className="flex items-center gap-3">
          <Input type="date" value={date} onChange={(e) => handleDateChange(e.target.value)}
            typeSearch={true}
          />

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-auto px-3 whitespace-nowrap">
              <span className="font-semibold text-slate-600 mr-1">Sort:</span>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest</SelectItem>
              <SelectItem value="asc">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isPending 
        ? (<div className="text-center py-6 text-slate-500">Loading...</div>) 
        : (<Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Check In & Out</TableHead>
              <TableHead>Total Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((att) => (
                <TableRow key={att.id}>
                  <TableCell>{safeFormat(att.date, "dd MMMM yyyy")}</TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-700 font-semibold">
                        {att.user?.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {att.user?.email}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {att.shift ? (
                      <Badge className={`px-2 py-0.5 border-none rounded-md 
                        ${shiftStyles[att.shift.type] ?? "bg-gray-100 text-gray-700"}
                      `}>
                        {capitalize(att.shift.name)}
                      </Badge>
                    ) : (<span className="text-sm text-gray-400">-</span>)}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-teal-500">
                        {safeFormat(att.checkInTime, "HH:mm")}
                      </span>
                      <span className="text-sm text-rose-500">
                        {safeFormat(att.checkOutTime, "HH:mm")}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {att.checkInTime && att.checkOutTime ? (
                      <span className="text-sm text-slate-700 font-semibold">
                        {calculateWorkHours(att.checkInTime, att.checkOutTime, 1)} Hours
                      </span>
                    ) : (<span className="text-sm text-gray-400">-</span>)}
                  </TableCell>

                  <TableCell>
                    <Badge className={`border-none ${attedancesStyles[capitalize(att.status)]}`}>
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

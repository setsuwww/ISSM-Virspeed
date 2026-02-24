"use client"

import { useMemo, useRef, useState } from "react"
import { User } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/_components/ui/Dialog"
import { Button } from "@/_components/ui/Button"
import { Badge } from "@/_components/ui/Badge"
import { Input } from "@/_components/ui/Input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/_components/ui/Select"

import { capitalize } from "@/_functions/globalFunction"
import { attendancesStyles } from "@/_constants/theme/attendanceTheme"
import { shiftStyles } from '@/_constants/shiftConstants';

export default function AttendancesUsers({
  selectedStatus,
  shifts = [],
  allUsers = [],
  onClose,
}) {
  const [shiftFilter, setShiftFilter] = useState("all")
  const [search, setSearch] = useState("")
  const searchInputRef = useRef(null)

  const isOpen = Boolean(selectedStatus)

  const totalUsers = useMemo(() => {
    if (!selectedStatus) return 0

    return allUsers.filter(
      (u) =>
        u.attendanceStatus === selectedStatus &&
        (shiftFilter === "all" || u._shiftType === shiftFilter) &&
        (u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()))
    ).length
  }, [allUsers, selectedStatus, shiftFilter, search])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl flex flex-col overflow-hidden">
        {!selectedStatus ? null : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-4 mb-4">

                <VisuallyHidden>
                  <DialogTitle>Attendance Dialog</DialogTitle>
                </VisuallyHidden>

                <div className="p-3 rounded-lg bg-indigo-100">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>

                <div>
                  <h1 className="text-xl font-semibold">Today's Attendance</h1>
                  <p className="text-sm text-slate-500">
                    {totalUsers} Employees
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Select value={shiftFilter} onValueChange={setShiftFilter}>
                <SelectTrigger className="w-fit px-3">
                  <span className="font-semibold text-slate-600">Shift:</span>
                  <SelectValue placeholder="All" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="MORNING">Morning</SelectItem>
                  <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                  <SelectItem value="EVENING">Evening</SelectItem>
                </SelectContent>
              </Select>

              <Input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="w-full sm:w-64"
                typeSearch
              />
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[55vh]">
              {shifts.map((shift) => {
                if (shiftFilter !== "all" && shift.type !== shiftFilter) return null

                const usersInShift = (shift.users || [])
                  .filter((u) => u.attendanceStatus === selectedStatus)
                  .filter(
                    (u) =>
                      u.name?.toLowerCase().includes(search.toLowerCase()) ||
                      u.email?.toLowerCase().includes(search.toLowerCase())
                  )

                if (!usersInShift.length) return null

                return (
                  <div key={shift.id} className="border rounded-lg bg-white">
                    <div className="px-4 py-2 bg-slate-50 border-b text-sm font-medium rounded-t-lg">
                      {capitalize(shift.type)} — {shift.divisionName}
                    </div>

                    {usersInShift.map((u) => (
                      <div key={u.id} className="px-4 py-3 flex justify-between border-b last:border-b-0">
                        <div>
                          <p className="font-medium text-slate-600">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <Badge className={shiftStyles[u.shiftType]}>
                            {capitalize(u.shiftType)}
                          </Badge>

                          {u.attendanceStatus === "PERMISSION" && (
                            <Badge variant="outline" className={attendancesStyles[u.approval]}>
                              {capitalize(u.approval || "PENDING")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

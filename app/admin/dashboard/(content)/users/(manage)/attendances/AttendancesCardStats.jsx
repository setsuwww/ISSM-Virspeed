"use client"

import { useState, useMemo, useCallback } from "react"
import { attendanceStatusClass } from "@/_constants/theme/attendanceTheme"

import AttendancesApprovalPartials from "./AttendancesApprovalPartials"
import AttendancesUsers from "./AttendancesUsers"

export function AttendancesCard({ shifts = [] }) {
  const [selectedStatus, setSelectedStatus] = useState(null)

  const allUsers = useMemo(() => {
    return shifts.flatMap((shift) =>
      (shift.users || []).map((u) => ({...u,
        attendanceStatus: String(u?.attendanceStatus || "PRESENT").toUpperCase(),
        approval: u?.approval ? String(u.approval).toUpperCase() : "PENDING",
        _shiftId: shift.id,
        _shiftType: shift.type,
        _shiftDivision: shift.divisionName,
      }))
    )
  }, [shifts])

  const handleOpen = useCallback((status) => { setSelectedStatus(status)}, [])
  const handleClose = useCallback(() => { setSelectedStatus(null)}, [])

  const defaultStatuses = useMemo(() => ["ABSENT", "LATE", "PERMISSION"], [])

  const statusSummary = useMemo(() => {
    return defaultStatuses.map((status) => {
      const users = allUsers.filter((u) => u.attendanceStatus === status)

      const approvalCounts = users.reduce(
        (acc, u) => {
          switch (u.approval) {
            case "ACCEPTED": acc.accepted++
              break
            case "REJECTED": acc.rejected++
              break
            default: acc.pending++
              break
          }
          return acc
        }, { accepted: 0, pending: 0, rejected: 0 }
      )
      return { status, users, approvalCounts }
    })
  }, [allUsers, defaultStatuses])

  return (
    <div>
      <div className="text-xs text-slate-500 flex items-center gap-2 mb-4">
        <span className="px-2 py-1 rounded-md bg-teal-50 text-teal-600">
          A = Accepted
        </span>
        <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-600">
          P = Pending
        </span>
        <span className="px-2 py-1 rounded-md bg-rose-50 text-rose-600">
          R = Rejected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusSummary.map(({ status, users, approvalCounts }) => (
          <AttendancesApprovalPartials key={status} status={status} users={users}
            approvalCounts={approvalCounts}
            statusColorsClass={attendanceStatusClass}
            onClick={() => users.length > 0 && handleOpen(status)}
          />
        ))}
      </div>

      <AttendancesUsers
        selectedStatus={selectedStatus}
        shifts={shifts}
        allUsers={allUsers}
        onClose={handleClose}
      />
    </div>
  )
}

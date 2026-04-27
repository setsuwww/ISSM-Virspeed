"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { attendanceStatusClass } from "@/_components/_constants/theme/attendanceTheme"
import { defaultStatuses } from "@/_components/_constants/attendanceConstants"

import AttendancesApprovalPartials from "./AttendancesApprovalPartials"
import AttendancesUsers from "./AttendancesUsers"
import { RequestToast } from "./RequestToast"
import { getPendingRequestsSummary } from "@/_servers/admin-services/request_action"

export function AttendancesCard({ shifts = [] }) {
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [requestSummary, setRequestSummary] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const res = await getPendingRequestsSummary()
      setRequestSummary(res)
    }
    fetchData()
  }, [])

  const allUsers = useMemo(() => {
    return shifts.flatMap((shift) =>
      (shift.users || []).map((u) => ({
        ...u,
        attendanceStatus: String(u?.attendanceStatus || "PRESENT").toUpperCase(),
        approval: u?.approval ? String(u.approval).toUpperCase() : "PENDING",
        _shiftId: shift.id,
        _shiftType: shift.type,
        _shiftLocation: shift.locationName,
      }))
    )
  }, [shifts])

  const handleOpen = useCallback((status, hasUsers) => { if (hasUsers) setSelectedStatus(status) }, []);
  const handleClose = useCallback(() => { setSelectedStatus(null) }, [])

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
        <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600">
          A = Accepted
        </span>
        <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-600">
          P = Pending
        </span>
        <span className="px-2 py-1 rounded-md bg-red-50 text-red-600">
          R = Rejected
        </span>
      </div>

      {requestSummary?.total > 0 && (
        <RequestToast summary={requestSummary} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusSummary.map(({ status, users, approvalCounts }) => (
          <AttendancesApprovalPartials key={status} status={status} users={users}
            approvalCounts={approvalCounts}
            statusColorsClass={attendanceStatusClass}
            onClick={() => handleOpen(status, users.length > 0)}
          />
        ))}
      </div>

      {/* Modal Attendance Detail */}
      <AttendancesUsers
        selectedStatus={selectedStatus}
        shifts={shifts}
        allUsers={allUsers}
        onClose={handleClose}
      />
    </div>
  )
}

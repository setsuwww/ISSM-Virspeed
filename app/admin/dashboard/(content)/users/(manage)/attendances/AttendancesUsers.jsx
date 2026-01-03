"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/_components/ui/Dialog"
import { Button } from "@/_components/ui/Button"
import { Badge } from "@/_components/ui/Badge"
import { capitalize } from "@/_function/globalFunction"
import { attedancesStyles } from "@/_constants/attendanceConstants"
import { User } from 'lucide-react';

export default function AttendancesUsersView({ selectedStatus, shifts, allUsers, onClose }) { 
  if (!selectedStatus) return null
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="mb-6">
          <DialogTitle className="flex flex-col">
            <div className="flex items-center space-x-2">
              <div className="p-3 bg-slate-200 text-slate-600 rounded-full">
                <User size={26} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm">Attendance detail</span>
                <span className="text-xs text-slate-400">
                  {allUsers.filter((u) => u.attendanceStatus === selectedStatus).length}{" "}Employees
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {shifts.map((shift) => {
            const usersInShift = (shift.users || [])
              .map((u) => ({...u, attendanceStatus: String(u?.attendanceStatus || "PRESENT")
                .toUpperCase(), approval: u?.approval ? String(u.approval).toUpperCase() : "",
              })).filter((u) => u.attendanceStatus === selectedStatus)
            if (!usersInShift.length) return null

            return (
              <div key={shift.id} className="border rounded-lg overflow-hidden bg-white">
                <div className="px-4 py-2 text-sm font-medium bg-slate-50 border-b text-slate-600">
                  {capitalize(String(shift.type || shift.name || "-"))} -{" "}
                  {shift.divisionName || "-"}
                </div>

                {usersInShift.map((u) => (
                  <div key={u.id} className="px-4 py-3 flex justify-between transition">
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-slate-600">
                            {u.name}
                          </span>
                          <div className="text-xs text-slate-400">
                            {u.email}
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <Badge className={`border-none ${attedancesStyles[u.attendanceStatus]}`}>
                            {capitalize(u.attendanceStatus)}
                          </Badge>

                          {u.attendanceStatus === "PERMISSION" && (
                            <span className="text-xs mt-1">
                              <Badge className={`border-0 px-2 py-0.5 ${ attedancesStyles[u.approval] || ""}`}>
                                {capitalize(u.approval) || "Pending"}
                              </Badge>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={onClose} variant="outline" className="w-full md:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

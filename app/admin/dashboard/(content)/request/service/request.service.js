"use server"

import {
  getShiftChangeRequests,
  getPermissionRequests,
  getEarlyCheckoutRequests,
  getLeaveRequests,
} from "./request.module"

import { mapShiftChange } from "./mapping/change.map"
import { mapPermission } from "./mapping/permission.map"
import { mapEarlyCheckout } from "./mapping/early.map"
import { mapLeave } from "./mapping/leave.map"

export async function handleRequests(mode) {
  const isHistory = mode === "history"

  const 
    [
      shiftRequests,
      permissionRequests,
      earlyCheckoutRequests,
      leaveRequests
    ] = await Promise.all([
        getShiftChangeRequests(isHistory),
        getPermissionRequests(isHistory),
        getEarlyCheckoutRequests(isHistory),
        getLeaveRequests(isHistory),
      ]
    )

  return {
    shift: shiftRequests.map(mapShiftChange),
    permission: permissionRequests.map(mapPermission),
    early: earlyCheckoutRequests.map(mapEarlyCheckout),
    leave: leaveRequests.map(mapLeave),
  }
}

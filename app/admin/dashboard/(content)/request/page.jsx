export const revalidate = 0
export const runtime = "nodejs"

import RequestsTabs from "./RequestsTabs"
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader"
import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"

import {
  fetchShiftRequests,
  fetchPermissionRequests,
  fetchEarlyCheckoutRequests,
  fetchLeaveRequests
} from "./service/request.module"

import { mapShiftChange } from './service/mapping/change.map'
import { mapEarlyCheckout } from './service/mapping/early.map'
import { mapLeave } from './service/mapping/leave.map'
import { mapPermission } from './service/mapping/permission.map'

async function getRequests(mode = "pending") {
  const isHistory = mode === "history"

  const [
    shift,
    attendance,
    earlyCheckout,
    leave
  ] = await Promise.all([
    fetchShiftRequests(isHistory),
    fetchPermissionRequests(isHistory),
    fetchEarlyCheckoutRequests(isHistory),
    fetchLeaveRequests(isHistory),
  ])

  return {
    shift: mapShiftChange(shift),
    attendance: mapPermission(attendance),
    earlyCheckout: mapEarlyCheckout(earlyCheckout),
    leave: mapLeave(leave)
  }
}

export default async function Page({ searchParams }) {
  const mode = searchParams?.mode ?? "pending"

  const { shift, attendance, earlyCheckout, leave } = await getRequests(mode)

  return (
    <section>
      <DashboardHeader
        title="Requests"
        subtitle={
          mode === "history"
            ? "All requests history"
            : "Manage pending requests by type"
        }
      />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation
            heading={mode === "history" ? "Request History" : "Pending Requests"}
            subheading="Switch between request types"
            show={false}
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <RequestsTabs
            changeShiftRequests={shift}
            permissionRequests={attendance}
            earlyCheckoutRequests={earlyCheckout}
            leaveRequests={leave}
            mode={mode}
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  )
}

export const revalidate = 0
export const runtime = "nodejs"

import RequestsTabs from "./RequestsTabs"
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader"
import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"
import { RequestClearHistory } from "./RequestClearHistory"

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

  const [ shift, attendance, earlyCheckout, leave ] = await Promise.all([
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
  const params = await searchParams
  const mode = params?.mode ?? "pending"

  const { shift, attendance, earlyCheckout, leave } = await getRequests(mode)

  return (
    <section>
      <DashboardHeader
        title="Requests"
        subtitle={mode === "history"
          ? "All requests history"
          : "Manage pending requests by type"
        }
      />

      <ContentForm>
        <ContentForm.Header>
          <div className="flex items-center justify-between w-full">
            <ContentInformation title={mode === "history" ? "Request History" : "Pending Requests"}
              subtitle="Switch between request types or clear history"
              show={false}
            />

            <RequestClearHistory type="changeshift" initialMode={mode} />
          </div>
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

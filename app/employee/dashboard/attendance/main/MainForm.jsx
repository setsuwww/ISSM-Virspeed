"use client"

import { useEffect, useState } from "react"
import { LogIn, LogOut, Plane, Shuffle, CheckCircle2, XCircle, AlertTriangle, Circle } from "lucide-react"

import { Card, CardContent } from "@/_components/ui/Card"
import { ContentInformation } from "@/_components/common/ContentInformation"
import LoadingStates from "@/_components/common/LoadingStates"

import { apiFetchData } from "@/_lib/fetch"
import { useUserSendAttendance } from "@/_client/handlers/employee/useUserSendAttendance"

import { MainActionCard } from "./MainActionCard"
import { MainStats } from "./MainStats"
import { EarlyCheckoutModal } from "./modal/EarlyCheckoutModal"
import { PermissionModal } from "./modal/PermissionModal"
import { LeaveModal } from "./modal/LeaveModal"

export default function CheckinForm() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const [reason, setReason] = useState("")
  const [earlyReason, setEarlyReason] = useState("")
  const [leaveReason, setLeaveReason] = useState("")
  const [showEarlyModal, setShowEarlyModal] = useState(false)
  const [showPermission, setShowPermission] = useState(false)
  const [showLeave, setShowLeave] = useState(false)

  const {
    isPending,
    checkIn,
    checkOut,
    earlyCheckout,
    permission,
    leave,
  } = useUserSendAttendance()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await apiFetchData({
          url: "/me",
          successMessage: null,
          errorMessage: "Failed to load user data",
        })
        setUser(userData)

        const statsData = await apiFetchData({
          url: `/attendance/employee-stats?userId=${userData.id}`,
          successMessage: null,
          errorMessage: "Failed to load stats",
        })
        setStats(statsData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <LoadingStates />

  return (
    <div className="p-8 space-y-8">
      <ContentInformation
        heading="Your Statistic"
        subheading="Views your attendance"
      />

      <MainStats
        items={[
          { icon: <CheckCircle2 />, label: "Present", value: stats?.PRESENT ?? 0, tone: "teal" },
          { icon: <XCircle />, label: "Absent", value: stats?.ABSENT ?? 0, tone: "rose" },
          { icon: <AlertTriangle />, label: "Permission", value: stats?.PERMISSION ?? 0, tone: "blue" },
          { icon: <Circle />, label: "Late", value: stats?.LATE ?? 0, tone: "yellow" },
        ]}
      />

      <Card className="border border-slate-200 shadow-sm pt-4">
        <CardContent className="space-y-5">
          <ContentInformation
            heading="Your Presence"
            subheading="Click once at cards below to send your status"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MainActionCard
              icon={<LogIn />}
              title="Check In"
              description="Start your working time"
              color="teal"
              onClick={checkIn}
              loading={isPending}
            />

            <MainActionCard
              icon={<LogOut />}
              title="Check Out"
              description="End your working time"
              color="rose"
              onClick={checkOut}
              loading={isPending}
            />
          </div>

          <ContentInformation
            heading="Send Request"
            subheading="Change your internal shift / attendance"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-3">
            <MainActionCard icon={<Plane />} title="Permission"
              description="Ask for permission"
              color="blue"
              onClick={() => setShowPermission(v => !v)}
            />

            <MainActionCard
              icon={<AlertTriangle />}
              title="Early Checkout"
              description="Checkout before scheduled time"
              color="amber"
              onClick={() => setShowEarlyModal(true)}
              loading={isPending}
            />

            <MainActionCard
              icon={<Plane />}
              title="Leave"
              description="Ask for leave"
              color="violet"
              onClick={() => setShowLeave(true)}
            />

            <MainActionCard
              icon={<Shuffle />}
              title="Change Shift"
              description="Request shift change"
              asLink
              href="/employee/dashboard/attendance/change-shift"
            />
          </div>
        </CardContent>
      </Card>

      <EarlyCheckoutModal open={showEarlyModal} loading={isPending} reason={earlyReason}
        onChangeReason={setEarlyReason}
        onClose={() => setShowEarlyModal(false)}
        onSubmit={() =>
          earlyCheckout(earlyReason, () => {
            setEarlyReason("")
            setShowEarlyModal(false)
          })
        }
      />

      <PermissionModal open={showPermission} loading={isPending} reason={reason}
        onChangeReason={setReason}
        onClose={() => { setShowPermission(false) }}
        onSubmit={() =>
          permission(reason, () => {
            setReason("")
            setShowPermission(false)
          })
        }
      />

      <LeaveModal
        open={showLeave}
        onOpenChange={setShowLeave}
        onSubmit={(data) =>
          leave({
            startDate: data.startDate,
            endDate: data.endDate,
            reason: data.type,
          },
            () => setShowLeave(false))
        }
      />
    </div>
  )
}

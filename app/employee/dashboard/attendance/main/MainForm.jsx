"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { LogIn, LogOut, Plane, Shuffle, CheckCircle2, XCircle, AlertTriangle, Circle } from "lucide-react"
import { Card, CardContent } from "@/_components/ui/Card"

import { userSendCheckIn, userSendEarlyCheckout, userSendCheckOut, userSendPermissionRequest } from "@/_server/employee-action/attendanceAction"
import { apiFetchData } from "@/_lib/fetch"
import { ContentInformation } from '@/_components/common/ContentInformation';
import LoadingStates from '@/_components/common/LoadingStates';

import { MainActionCard } from "./MainActionCard"
import { MainStats } from "./MainStats"
import { InputEarlyCODialog } from "./InputEarlyCheckoutDialog"
import { InputPermissionDialog } from "./InputPermissionDialog"

export default function CheckinForm() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [reason, setReason] = useState("")
  const [showEarlyModal, setShowEarlyModal] = useState(false)
  const [earlyReason, setEarlyReason] = useState("")
  const [showPermission, setShowPermission] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiFetchData({
          url: "/me",
          successMessage: null, errorMessage: "Failed to load user data",
        })
        setUser(data)

        const statsData = await apiFetchData({
          url: `/attendance/employee-stats?userId=${data.id}`,
          successMessage: null,
          errorMessage: "Failed to load stats",
        })
        setStats(statsData)
      }
      catch (err) { console.error("Failed to fetch user:", err) }
      finally { setLoading(false) }
    }

    fetchUser()
  }, [])

  const handleCheckIn = () => startTransition(async () => {
    try {
      const precheck = await userSendCheckIn(null)

      if (precheck?.requireLocation === false) {
        const result = await userSendCheckIn({ skipLocation: true })

        if (result?.error) toast.error(result.error)
        else if (result?.toast) toast.warning(result.toast)
        else toast.success("Checked in successfully")

        return
      }

      if (!navigator.geolocation) {
        toast.error("Browser kamu tidak mendukung geolocation.")
        return
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const coords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      }

      const result = await userSendCheckIn(coords)

      if (result?.error) toast.error(result.error)
      else if (result?.toast) toast.warning(result.toast)
      else toast.success("Checked in successfully")

    } catch (err) { toast.error("Checked in failed, your shift was end!") }
  })

  const handleCheckOut = () => startTransition(async () => {
    const result = await userSendCheckOut()
    if (result?.error) toast.error(result.error)
    else toast.success("Checked out successfully")
  })

  const handlePermission = () => startTransition(async () => {
    const result = await userSendPermissionRequest(reason)
    if (result?.error) toast.error(result.error)
    else {
      toast.success("Permission request sent")
      setReason("")
      setShowPermission(false)
    }
  })

  if (loading) {
    return <LoadingStates />
  }

  return (
    <div className="p-8 space-y-8">
      <ContentInformation heading="Your Statistic" subheading="Views your attendance" />
      <MainStats items={[
        { icon: <CheckCircle2 />, label: "Present", value: stats?.PRESENT ?? 0, tone: "teal" },
        { icon: <XCircle />, label: "Absent", value: stats?.ABSENT ?? 0, tone: "rose" },
        { icon: <AlertTriangle />, label: "Permission", value: stats?.PERMISSION ?? 0, tone: "blue" },
        { icon: <Circle />, label: "Late", value: stats?.LATE ?? 0, tone: "yellow" },
      ]}
      />

      <Card className="border border-slate-200 shadow-sm pt-4">
        <CardContent className="space-y-5">
          <ContentInformation heading="Your Presence" subheading="Click once at cards below to send your status" />
          <MainActionCard icon={<LogIn />}
            title="Check In" description="Start your working time" color="teal"
            onClick={handleCheckIn} loading={isPending}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MainActionCard icon={<LogOut />}
              title="Check Out" description="End your working time" color="rose"
              onClick={handleCheckOut} loading={isPending}
            />

            <MainActionCard icon={<AlertTriangle />}
              title="Early Check Out" description="Checkout before scheduled time" color="amber"
              onClick={() => setShowEarlyModal(true)} loading={isPending}
            />
          </div>

          <ContentInformation heading="Send Request" subheading="Change your internal shift / attendance" />
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${showPermission ? "pb-2" : "pb-4"}`}>
            <MainActionCard icon={<Plane />}
              title={showPermission ? "Cancel Permission" : "Request Permission"}
              description="Ask for leave or permission" color="blue"
              onClick={() => setShowPermission(v => !v)}
            />

            <MainActionCard icon={<Shuffle />}
              title="Change Shift" description="Request shift change"
              asLink href="/employee/dashboard/attendance/change-shift"
            />
          </div>

          {showPermission && (
            <InputPermissionDialog
              reason={reason}
              loading={isPending}
              onChangeReason={setReason}
              onCancel={() => setShowPermission(false)}
              onSubmit={handlePermission}
            />
          )}
        </CardContent>
      </Card>
      <InputEarlyCODialog open={showEarlyModal} loading={isPending}
        reason={earlyReason} onChangeReason={setEarlyReason}
        onClose={() => setShowEarlyModal(false)}
        onSubmit={() =>
          startTransition(async () => {
            const result = await userSendEarlyCheckout(earlyReason)

            if (result?.error) {
              toast.error(result.error)
              return
            }

            toast.success("Early checkout request sent")
            setEarlyReason("")
            setShowEarlyModal(false)
          })
        }
      />
    </div>
  )
}

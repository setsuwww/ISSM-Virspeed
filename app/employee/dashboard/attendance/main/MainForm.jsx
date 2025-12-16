"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { Clock, LogIn, LogOut, Plane, Shuffle, CheckCircle2, XCircle, AlertTriangle, Circle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/_components/ui/Card"
import { userSendCheckIn, userSendCheckOut, userSendPermissionRequest } from "@/_server/employee-action/attendanceAction"
import { apiFetchData } from "@/_lib/fetch"
import { Button } from "@/_components/ui/Button"
import { ContentInformation } from '@/_components/common/ContentInformation';
import { Label } from '@/_components/ui/Label';
import LoadingStates from '@/_components/common/LoadingStates';
import { MainActionCard } from "./MainActionCard"
import { MainStats } from "./MainStats"

export default function CheckinForm() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [reason, setReason] = useState("")
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
          url: `/attendance/stats?userId=${data.id}`,
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
      else toast.success("Checked in successfully")
    } catch (err) {
      console.error("Location error:", err)
      toast.error("Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan.")
    }
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
          { icon: <AlertTriangle />, label: "Permission", value: stats?.PERMISSION ?? 0, tone: "amber" },
          { icon: <Circle />, label: "Late", value: stats?.LATE ?? 0, tone: "slate" },
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
              onClick={handleCheckOut} loading={isPending}
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
            <div className="border border-dashed border-amber-300 bg-amber-50/50 p-4 mb-4 rounded-xl space-y-3">
              <Label>
                Reason <span className="text-rose-500">*</span>
              </Label>

              <input value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="Enter your reason..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-100 focus:outline focus:outline-indigo-50 focus:border-indigo-200 text-sm"
              />

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPermission(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePermission} disabled={!reason.trim() || isPending}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon, label, value, tone }) {
  const tones = {
    teal: "bg-teal-50 text-teal-600 border-teal-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
  }

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`p-3 rounded-xl border ${tones[tone]}`}>
          {icon}
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-slate-500">{label}</span>
          <span className="text-3xl font-semibold text-slate-800">
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}


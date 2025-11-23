"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { Clock, LogIn, LogOut, Plane, Shuffle, CheckCircle2, XCircle, AlertTriangle, Circle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/_components/ui/Card"
import { userSendCheckIn, userSendCheckOut, userSendPermissionRequest } from "@/_server/attendanceAction"
import { apiFetchData } from "@/_lib/fetch"
import { Button } from "@/_components/ui/Button"
import { ContentInformation } from '@/_components/common/ContentInformation';
import Link from 'next/link';
import { Label } from '@/_components/ui/Label';
import LoadingStates from '@/_components/common/LoadingStates';

export default function CheckinForm() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [reason, setReason] = useState("")
  const [showPermission, setShowPermission] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const fetchUser = async () => {
      try { const data = await apiFetchData({ url: "/me",
          successMessage: null, errorMessage: "Failed to load user data",
        })
        setUser(data)

        const statsData = await apiFetchData({ url: `/attendance/stats?userId=${data.id}`,
          successMessage: null,
          errorMessage: "Failed to load stats",
        })
        setStats(statsData)
      } 
      catch (err) { console.error("Failed to fetch user:", err)} 
      finally { setLoading(false)}
    }

    fetchUser()
  }, [])

  const handleCheckIn = () => startTransition(async () => {
    try { if (!navigator.geolocation) {
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
    else { toast.success("Permission request sent")
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <StatCard
          iconClassName="bg-gradient-to-tr from-teal-100 to-teal-50 text-teal-500 border-teal-100"
          icon={<CheckCircle2 />}
          label="Present"
          value={stats?.PRESENT ?? 0}
        />
        <StatCard
          iconClassName="bg-gradient-to-tr from-rose-100 to-rose-50 text-rose-500 border-rose-100"
          icon={<XCircle />}
          label="Absent"
          value={stats?.ABSENT ?? 0}
        />
        <StatCard
          iconClassName="bg-gradient-to-tr from-yellow-100 to-yellow-50 text-yellow-500 border-yellow-100"
          icon={<AlertTriangle />}
          label="Permission"
          value={stats?.PERMISSION ?? 0}
        />
        <StatCard
          iconClassName="bg-gradient-to-tr from-slate-100 to-slate-50 text-slate-500 border-slate-100"
          icon={<Circle />}
          label="Late"
          value={stats?.LATE ?? 0}
        />
      </div>

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-full">
                <Clock size={24} />
              </div>
              <ContentInformation heading="Quick Actions" subheading="Make your actions more faster here" autoMargin={false} />
            </div> 
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
            <Button onClick={handleCheckIn} disabled={isPending}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Check In
            </Button>

            <Button onClick={handleCheckOut} disabled={isPending}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Check Out
            </Button>

            <Button onClick={() => setShowPermission((close) => !close)} variant="outline" className="w-full flex items-center gap-2 text-yellow-600 hover:bg-yellow-500/5 hover:text-yellow-700 hover:border-yellow-500/20">
              <Plane className="w-4 h-4" />
              {showPermission ? "Cancel Permission" : "Permission"}
            </Button>

            <Button asChild variant="outline" className="w-full flex items-center gap-2 text-slate-600">
              <Link href="/employee/dashboard/attendance/change-shift">
                <Shuffle className="w-4 h-4" />
                Change Shift
              </Link>
            </Button>
          </div>

          {showPermission && (
            <div className="mt-4 space-y-3 mb-2">
              <Label>Reason <span className="text-rose-500">*</span></Label>
              <input type="text" placeholder="Enter your reason..." value={reason} onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPermission(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePermission} disabled={isPending || !reason.trim()} className="bg-amber-600 hover:bg-amber-700 text-white">
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

function StatCard({ iconClassName ,icon, label, value }) {
  return (
    <Card className="border border-slate-200 shadow-xs">
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-sm text-slate-500">{label}</p>
          <h3 className="text-3xl font-semibold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 flex items-center justify-center border rounded-full ${iconClassName}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

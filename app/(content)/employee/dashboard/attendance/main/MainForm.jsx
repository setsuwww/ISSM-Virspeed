"use client"

import { useEffect, useState, useCallback } from "react"
import { LogIn, LogOut, Plane, Shuffle, CheckCircle2, XCircle, AlertTriangle, Circle } from "lucide-react"

import { Card, CardContent } from "@/_components/ui/Card"
import { ContentInformation } from "@/_components/common/ContentInformation"
import LoadingStates from "@/_components/common/LoadingStates"

import { apiFetchData } from "@/_lib/fetch"
import { useUserSendAttendance } from "@/_clients/handlers/employee/useUserSendAttendance"

import { MainActionCard } from "./MainActionCard"
import { MainStats } from "./MainStats"
import { EarlyCheckoutModal } from "./modal/EarlyCheckoutModal"
import { PermissionModal } from "./modal/PermissionModal"
import { LeaveModal } from "./modal/LeaveModal"
import { CheckoutTimer } from "@/_components/common/CheckoutTimer"

const MODAL = {
  EARLY: "EARLY",
  PERMISSION: "PERMISSION",
  LEAVE: "LEAVE",
}

export default function CheckinForm() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentAttendance, setCurrentAttendance] = useState(null)

  const [modal, setModal] = useState({
    type: null,
    reason: "",
  })

  const { isPending,
    checkIn, checkOut, earlyCheckout, permission, leave,
  } = useUserSendAttendance()

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      try {
        const userData = await apiFetchData({
          url: "/me",
          successMessage: null,
          errorMessage: "Failed to load user data",
        })

        if (!mounted) return
        setUser(userData)

        const statsData = await apiFetchData({
          url: `/attendance/employee-stats?userId=${userData.id}`,
          successMessage: null,
          errorMessage: "Failed to load stats",
        })

        if (!mounted) return
        setStats(statsData)

        // 🔥 INI YANG KAMU LUPA TARUH DI SINI
        const currentData = await apiFetchData({
          url: `/attendance/employee-stats/can-checkout?userId=${userData.id}`,
          successMessage: null,
          errorMessage: "Failed to load current attendance",
        })

        if (!mounted) return
        setCurrentAttendance(currentData)

      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [])

  const openModal = useCallback((type) => {
    setModal({ type, reason: "" })
  }, [])

  const closeModal = useCallback(() => {
    setModal({ type: null, reason: "" })
  }, [])

  const onChangeReason = useCallback((value) => {
    setModal((prev) => ({ ...prev, reason: value }))
  }, [])

  const handleEarlyCheckout = useCallback(() => {
    earlyCheckout(modal.reason, closeModal)
  }, [earlyCheckout, modal.reason, closeModal])

  const handlePermission = useCallback(() => {
    permission(modal.reason, closeModal)
  }, [permission, modal.reason, closeModal])

  const handleLeave = useCallback(
    (data) => {
      leave(
        {
          type: data.type,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
        },
        closeModal)
    }, [leave, closeModal]
  )

  if (loading) return <LoadingStates />

  return (
    <div className="p-8 space-y-8">
      <ContentInformation title="Your Statistic" subtitle="Views your attendance" />

      {currentAttendance && (
        <CheckoutTimer attendance={currentAttendance} />
      )}

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
          <ContentInformation title="Your Presence" subtitle="Click once at cards below to send your status" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MainActionCard icon={<LogIn />} title="Check In" description="Start your working time"
              color="teal"
              onClick={checkIn}
              loading={isPending}
            />

            <MainActionCard icon={<LogOut />} title="Check Out" description="End your working time"
              color="rose"
              onClick={checkOut}
              loading={isPending}
            />
          </div>

          <ContentInformation title="Send Request" subtitle="Change your internal shift / attendance" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-3">

            <MainActionCard
              variant="dual"
              icon={<Plane strokeWidth={1.5} />}
              title="Send Request"
              description="Permission or leave request"
              color="gowsh-blue"
              dropdownItems={[
                {
                  label: "Permission",
                  bgColor: "bg-sky-100 text-sky-700",
                  icon: <AlertTriangle size={16} strokeWidth={2} />,
                  onClick: () => openModal(MODAL.PERMISSION),
                },
                {
                  label: "Leave Request",
                  bgColor: "bg-violet-100 text-violet-700",
                  icon: <Plane size={16} strokeWidth={2} />,
                  onClick: () => openModal(MODAL.LEAVE),
                },
              ]}
            />

            <MainActionCard icon={<AlertTriangle strokeWidth={1.5} />} title="Early Checkout" description="Checkout before scheduled time"
              color="gowsh-amber" onClick={() => openModal(MODAL.EARLY)}
              loading={isPending}
            />

            <MainActionCard icon={<Shuffle strokeWidth={1.5} />} title="Change Shift" description="Request shift change"
              asLink
              href="/employee/dashboard/attendance/change-shift"
            />
          </div>
        </CardContent>
      </Card>

      <EarlyCheckoutModal
        open={modal.type === MODAL.EARLY}
        loading={isPending}
        reason={modal.reason}
        onChangeReason={onChangeReason}
        onClose={closeModal}
        onSubmit={handleEarlyCheckout}
      />

      <PermissionModal
        open={modal.type === MODAL.PERMISSION}
        loading={isPending}
        reason={modal.reason}
        onChangeReason={onChangeReason}
        onClose={closeModal}
        onSubmit={handlePermission}
      />

      <LeaveModal
        open={modal.type === MODAL.LEAVE}
        onOpenChange={closeModal}
        onSubmit={handleLeave}
      />
    </div>
  )
}

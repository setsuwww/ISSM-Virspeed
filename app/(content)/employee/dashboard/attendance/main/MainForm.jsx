"use client"

import { useEffect, useState, useCallback } from "react"
import { LogIn, LogOut, Plane, Shuffle, CheckCircle2, XCircle, AlertTriangle, Circle } from "lucide-react"

import { Card, CardContent } from "@/_components/ui/Card"
import { ContentInformation } from "@/_components/common/ContentInformation"
import LoadingStates from "@/_components/common/LoadingStates"

import { apiFetchData } from "@/_lib/fetch"
import { useUserSendAttendance } from "@/_clients/handlers/employee/useUserSendAttendance"
import { userPrecheckCheckIn } from "@/_servers/employee-services/attendance_action"

import { MainActionCard } from "./MainActionCard"
import { MainStats } from "./MainStats"
import { EarlyCheckoutModal } from "./modal/EarlyCheckoutModal"
import { ConfirmEarlyModal } from "./modal/ConfirmEarlyModal"
import { PermissionModal } from "./modal/PermissionModal"
import { LeaveModal } from "./modal/LeaveModal"
import { CheckoutTimer } from "@/_components/common/CheckoutTimer"

const MODAL = {
  EARLY: "EARLY",
  CONFIRM_EARLY: "CONFIRM_EARLY",
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

  const [precheck, setPrecheck] = useState({
    checkIn: { disabled: true },
    checkOut: { disabled: true },
  })

  const { isPending,
    checkIn, checkOut, earlyCheckout, permission, leave, manualActivate
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

        const [statsData, currentData, precheckData] = await Promise.all([
          apiFetchData({
            url: `/attendance/employee-stats?userId=${userData.id}`,
            successMessage: null,
            errorMessage: "Failed to load stats",
          }),
          apiFetchData({
            url: `/attendance/employee-stats/can-checkout?userId=${userData.id}`,
            successMessage: null,
            errorMessage: "Failed to load current attendance",
          }),
          userPrecheckCheckIn()
        ])

        if (!mounted) return
        setStats(statsData)
        setCurrentAttendance(currentData)
        setPrecheck(precheckData)

      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()

    const interval = setInterval(fetchData, 30000) // Poll every 30s

    return () => {
      mounted = false
    }
  }, [])

  const openModal = useCallback((type) => {
    setModal({ type, reason: "" })
  }, [])

  const closeModal = useCallback(() => {
    setModal({
      type: null,
      reason: "",
    })
  }, [])

  const onChangeReason = useCallback((value) => {
    setModal((prev) => ({ ...prev, reason: value }))
  }, [])

  const handleCheckIn = useCallback(async () => {
    try {
      await checkIn()
      window.location.reload()
    } catch (err) {}
  }, [checkIn])

  const handleCheckOutClick = useCallback(() => {
    if (precheck.checkOut?.isEarly) {
      openModal(MODAL.CONFIRM_EARLY)
    } else {
      checkOut()
    }
  }, [precheck.checkOut, openModal, checkOut])

  const handleEarlyCheckout = useCallback(async () => {
    try {
      await earlyCheckout(modal.reason)
      closeModal()
    }
    catch (err) { alert(err) }
  }, [earlyCheckout, modal.reason, closeModal])

  const handlePermission = useCallback(async () => {
    try {
      await permission(modal.reason)
      closeModal()
    }
    catch (err) { alert(err) }
  }, [permission, modal.reason, closeModal])

  const handleLeave = useCallback(async (data) => {
    try {
      await leave({
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
      })
      closeModal()
    }
    catch (err) { alert(err) }
  }, [leave, closeModal])

  const handleManualActivate = useCallback(async () => {
    try {
      await manualActivate()
      window.location.reload()
    }
    catch (err) { alert(err) }
  }, [manualActivate])

  if (loading) return <LoadingStates />

  return (
    <div className="p-8 space-y-8">
      <ContentInformation title="Your Statistic" subtitle="Views your attendance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentAttendance?.attendance && (
          <CheckoutTimer attendance={currentAttendance} />
        )}
      </div>

      <MainStats
        items={[
          { icon: <XCircle strokeWidth={1.5} className="w-6 h-6" />, label: "Absent", value: stats?.ABSENT ?? 0, tone: "rose" },
          { icon: <Circle strokeWidth={1.5} className="w-6 h-6" />, label: "Late", value: stats?.LATE ?? 0, tone: "yellow" },
          { icon: <CheckCircle2 strokeWidth={1.5} className="w-6 h-6" />, label: "Present", value: stats?.PRESENT ?? 0, tone: "teal" },
          { icon: <AlertTriangle strokeWidth={1.5} className="w-6 h-6" />, label: "Permission", value: stats?.PERMISSION ?? 0, tone: "blue" },
        ]}
      />

      <Card className="border border-slate-200 shadow-sm pt-4">
        <CardContent className="space-y-5">
          <ContentInformation title="Your Presence" subtitle="Click once at cards below to send your status" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MainActionCard
              icon={<CheckCircle2 />}
              title="Activate Now"
              description={user?.isActive ? "Your account is active" : "Re-activate your account now"}
              color={user?.isActive ? "slate" : "gowsh-blue"}
              onClick={handleManualActivate}
              disabled={user?.isActive}
              loading={isPending}
            />

            <MainActionCard icon={<LogIn />} title="Check In" description={precheck.checkIn?.reason || "Start your working time"}
              color="teal"
              onClick={handleCheckIn}
              loading={isPending}
              disabled={precheck.checkIn?.disabled}
              isShiny={precheck.checkIn?.isShiny}
            />

            <MainActionCard icon={<LogOut />} title="Check Out" description={precheck.checkOut?.reason || "End your working time"}
              color="rose"
              onClick={handleCheckOutClick}
              loading={isPending}
              disabled={precheck.checkOut?.disabled}
              forgotCheckout={precheck.checkOut?.isForgot}
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
                  bgColor: "border-0 border-t border-sky-300 bg-sky-100 text-sky-700",
                  icon: <AlertTriangle size={16} strokeWidth={2} />,
                  onClick: () => openModal(MODAL.PERMISSION),
                },
                {
                  label: "Leave",
                  bgColor: "border-0 border-t border-violet-300 bg-violet-100 text-violet-700",
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

      <ConfirmEarlyModal
        open={modal.type === MODAL.CONFIRM_EARLY}
        loading={isPending}
        onClose={closeModal}
        onSubmit={() => {
          closeModal()
          openModal(MODAL.EARLY)
        }}
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

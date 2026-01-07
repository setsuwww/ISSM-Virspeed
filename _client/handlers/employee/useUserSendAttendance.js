"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import {
  userSendCheckIn,
  userSendCheckOut,
  userSendEarlyCheckout,
  userSendPermissionRequest,
} from "@/_server/employee-action/attendanceAction"

export function useUserSendAttendance() {
  const [isPending, startTransition] = useTransition()

  const checkIn = () =>
    startTransition(async () => {
      try {
        const precheck = await userSendCheckIn(null)

        if (precheck?.requireLocation === false) {
          const res = await userSendCheckIn({ skipLocation: true })
          res?.error ? toast.error(res.error) : toast.success("Checked in successfully")
          return
        }

        if (!navigator.geolocation) {
          toast.error("Browser tidak mendukung geolocation")
          return
        }

        const position = await new Promise < GeolocationPosition > ((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          })
        )

        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }

        const res = await userSendCheckIn(coords)
        res?.error ? toast.error(res.error) : toast.success("Checked in successfully")
      } catch {
        toast.error("Check in failed, Check your location, connection, and try again or maybe your shift was End.")
      }
    })

  const checkOut = () =>
    startTransition(async () => {
      const res = await userSendCheckOut()
      res?.error ? toast.error(res.error) : toast.success("Checked out successfully")
    })

  const earlyCheckout = (reason, onSuccess) =>
    startTransition(async () => {
      const res = await userSendEarlyCheckout(reason)
      if (res?.error) {
        toast.error(res.error)
        return
      }
      toast.success("Early checkout request sent")
      onSuccess?.()
    })

  const permission = (reason, onSuccess) =>
    startTransition(async () => {
      const res = await userSendPermissionRequest(reason)
      if (res?.error) {
        toast.error(res.error)
        return
      }
      toast.success("Permission request sent")
      onSuccess?.()
    })

  return {
    isPending,
    checkIn,
    checkOut,
    earlyCheckout,
    permission,
  }
}

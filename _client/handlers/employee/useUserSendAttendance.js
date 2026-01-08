"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import {
  userPrecheckCheckIn,
  userSendCheckIn,
  userSendCheckOut,
  userSendEarlyCheckout,
  userSendPermissionRequest,
  userSendLeaveRequest,
} from "@/_server/employee-action/attendanceAction"

export function useUserSendAttendance() {
  const [isPending, startTransition] = useTransition()

  const checkIn = () =>
    startTransition(async () => {
      try {
        // precheck server-side
        const precheck = await userPrecheckCheckIn()

        if (precheck?.error) {
          toast.error(precheck.error)
          return
        }

        // without geolocation
        if (precheck?.requireLocation === false) {
          const res = await userSendCheckIn({ skipLocation: true })

          if (res?.error) {
            toast.error(res.error)
          } else {
            toast.success("Checked in successfully")
          }
          return
        }

        // Need geolocation
        if (!navigator.geolocation) {
          toast.error("Browser tidak mendukung geolocation")
          return
        }

        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            (err) => {
              switch (err.code) {
                case err.PERMISSION_DENIED:
                  reject(new Error("Izin lokasi ditolak"))
                  break
                case err.POSITION_UNAVAILABLE:
                  reject(new Error("Lokasi tidak tersedia"))
                  break
                case err.TIMEOUT:
                  reject(new Error("Lokasi terlalu lama didapatkan (timeout)"))
                  break
                default:
                  reject(new Error("Gagal mendapatkan lokasi"))
              }
            },
            {
              enableHighAccuracy: false,
              timeout: 20000,
              maximumAge: 60000,
            }
          )
        })

        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }

        // Real data
        const res = await userSendCheckIn(coords)

        if (res?.error) { toast.error(res.error)} 
        else { toast.success("Checked in successfully")}
      } 
      catch (err) { console.error(err)
        toast.error( err?.message ??
          "Check in gagal. Periksa koneksi, lokasi, atau waktu shift."
        )
      }
    })

  const checkOut = () =>
    startTransition(async () => {
      try {
        const res = await userSendCheckOut()
        res?.error
          ? toast.error(res.error)
          : toast.success("Checked out successfully")
      } catch (err) {
        console.error(err)
        toast.error("Checkout gagal")
      }
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

  const leave = (payload, onSuccess) =>
    startTransition(async () => {
      const res = await userSendLeaveRequest(payload)
      if (res?.error) {
        toast.error(res.error)
        return
      }
      toast.success("Leave request sent")
      onSuccess?.()
    })

  return {
    isPending,
    checkIn,
    checkOut,
    earlyCheckout,
    permission,
    leave,
  }
}

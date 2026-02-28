"use client";

import { useTransition } from "react";
import { useToast } from "@/_contexts/Toast-Provider";
import { useActionHelper } from "@/_stores/common/useActionStore";

import {
  userPrecheckCheckIn,
  userSendCheckIn,
  userSendCheckOut,
  userSendEarlyCheckout,
  userSendPermissionRequest,
  userSendLeaveRequest,
} from "@/_servers/employee-action/attendanceAction";

export function useUserSendAttendance() {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const { withTry } = useActionHelper();

  const checkIn = () =>
    startTransition(async () => {
      try {
        const precheck = await userPrecheckCheckIn();

        if (precheck?.error) return toast.error(precheck.error);

        // skipLocation case
        if (precheck?.requireLocation === false) {
          await withTry(
            () => userSendCheckIn({ skipLocation: true }),
            "Checked in successfully",
            "Check in gagal"
          );
          return;
        }

        if (!navigator.geolocation)
          return toast.error("Browser tidak mendukung geolocation");

        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            (err) => {
              switch (err.code) {
                case err.PERMISSION_DENIED:
                  reject(new Error("Izin lokasi ditolak"));
                  break;
                case err.POSITION_UNAVAILABLE:
                  reject(new Error("Lokasi tidak tersedia"));
                  break;
                case err.TIMEOUT:
                  reject(new Error("Lokasi terlalu lama didapatkan (timeout)"));
                  break;
                default:
                  reject(new Error("Gagal mendapatkan lokasi"));
              }
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
          );
        });

        const coords = { lat: position.coords.latitude, lon: position.coords.longitude };

        await withTry(() => userSendCheckIn(coords), "Checked in successfully", "Check in gagal");
      } catch (err) {
        console.error(err);
        toast.error(err?.message ?? "Check in gagal. Periksa koneksi, lokasi, atau waktu shift.");
      }
    });

  const checkOut = () =>
    startTransition(() =>
      withTry(() => userSendCheckOut(), "Checked out successfully", "Checkout gagal")
    );

  const earlyCheckout = (reason, onSuccess) =>
    startTransition(() =>
      withTry(
        () => userSendEarlyCheckout(reason),
        "Early checkout request sent",
        "Early checkout request gagal",
        { onSuccess }
      )
    );

  const permission = (reason, onSuccess) =>
    startTransition(() =>
      withTry(
        () => userSendPermissionRequest(reason),
        "Permission request sent",
        "Permission request gagal",
        { onSuccess }
      )
    );

  const leave = (payload, onSuccess) =>
    startTransition(() =>
      withTry(
        () => userSendLeaveRequest(payload),
        "Leave request sent",
        "Leave request gagal",
        { onSuccess }
      )
    );

  return { isPending, checkIn, checkOut, earlyCheckout, permission, leave };
}

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

        if (precheck?.requireLocation === false) {
          const result = await userSendCheckIn({ skipLocation: true });
          if (result?.error) return toast.error(result.error);
          toast.success("Checked in successfully");
          return;
        }

        if (!navigator.geolocation)
          return toast.error("Browser is not support geolocation");

        const position = await new Promise < GeolocationPosition > ((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            (err) => {
              switch (err.code) {
                case err.PERMISSION_DENIED:
                  reject(new Error("Location permission denied!"));
                  break;
                case err.POSITION_UNAVAILABLE:
                  reject(new Error("Location is unavailable!"));
                  break;
                case err.TIMEOUT:
                  reject(new Error("Location is long to catch, request timeout!"));
                  break;
                default:
                  reject(new Error("Failed to get location!"));
              }
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
          );
        });

        const coords = { lat: position.coords.latitude, lon: position.coords.longitude };
        const result = await userSendCheckIn(coords);

        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Checked in successfully");
        }
      } catch (err) {
        toast.error(err?.message ?? "Checkin failes. Check your internet, location or your time-shift");
      }
    });

  const checkOut = () =>
    startTransition(async () => {
      try {
        const result = await userSendCheckOut();

        if (result?.error) { toast.error(result.error)}
        else { toast.success("Checked out successfully")}
      }
      catch (err) { toast.error(err?.message ?? "Checkout failes. Check your internet, location or your time-shift")}
    });

  const earlyCheckout = (reason, onSuccess) =>
    startTransition(() =>
      withTry(
        () => userSendEarlyCheckout(reason),
        "Early checkout request sent",
        "Early checkout request failed to sent",
        { onSuccess }
      )
    );

  const permission = (reason, onSuccess) =>
    startTransition(() =>
      withTry(
        () => userSendPermissionRequest(reason),
        "Permission request sent",
        "Permission request failed to sent",
        { onSuccess }
      )
    );

  const leave = (payload, onSuccess) =>
    startTransition(() =>
      withTry(
        () => userSendLeaveRequest(payload),
        "Leave request sent",
        "Leave request failed to sent",
        { onSuccess }
      )
    );

  return { isPending, checkIn, checkOut, earlyCheckout, permission, leave };
}

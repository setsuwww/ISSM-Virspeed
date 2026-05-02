"use client";

import { useTransition } from "react";
import { useToast } from "@/_clients/_contexts/Toast-Provider";
import { useActionHelper } from "@/_stores/common/useActionStore";

import {
  userPrecheckCheckIn,
  userSendCheckIn,
  userSendCheckOut,
  userSendEarlyCheckout,
  userSendPermissionRequest,
  userSendLeaveRequest,
  userManualActivate,
} from "@/_servers/employee-services/attendance_action";
import { useRouter } from "next/navigation";

export function useUserSendAttendance() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { withTry } = useActionHelper();
  const toast = useToast();

  // ✅ helper biar bisa await
  const run = (fn) =>
    new Promise((resolve, reject) => {
      startTransition(async () => {
        try {
          const res = await fn();
          resolve(res);
        } catch (err) {
          reject(err);
        }
      });
    });

  const checkIn = () =>
    run(async () => {
      const precheck = await userPrecheckCheckIn();

      if (precheck?.error) {
        toast.error(precheck.error);
        throw new Error(precheck.error);
      }

      if (precheck?.requireLocation === false) {
        const result = await userSendCheckIn({ skipLocation: true });
        if (result?.error) {
          toast.error(result.error);
          throw new Error(result.error);
        }
        toast.success("Checked in successfully");
        return result;
      }

      if (!navigator.geolocation) {
        throw new Error("Browser not support geolocation");
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (err) => reject(err),
          { timeout: 20000 }
        );
      });

      const coords = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };

      const result = await userSendCheckIn(coords);

      if (result?.error) {
        toast.error(result.error);
        throw new Error(result.error);
      } else {
        router.refresh()
      }

      toast.success("Checked in successfully");
      return result;
    });

  const checkOut = () =>
    run(async () => {
      const result = await userSendCheckOut();

      if (result?.error) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      toast.success("Checked out successfully");
      return result;
    });

  const earlyCheckout = (reason) =>
    run(() =>
      withTry(
        () => userSendEarlyCheckout(reason),
        "Early checkout request sent",
        "Early checkout request failed to send"
      )
    );

  const permission = (reason) =>
    run(() =>
      withTry(
        () => userSendPermissionRequest(reason),
        "Permission request sent",
        "Permission request failed to send"
      )
    );

  const leave = (data) =>
    run(() =>
      withTry(
        () => userSendLeaveRequest(data),
        "Leave request sent",
        "Leave request failed to send"
      )
    );

  const manualActivate = () =>
    run(() =>
      withTry(
        () => userManualActivate(),
        "Account activated successfully",
        "Failed to activate account"
      )
    );

  return { isPending, checkIn, checkOut, earlyCheckout, permission, leave, manualActivate };
}

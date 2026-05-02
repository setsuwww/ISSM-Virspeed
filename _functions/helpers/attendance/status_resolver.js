import { MINUTE_MS } from "@/_lib/time";

export function resolveCheckInStatus(checkInTime, shiftStart) {
  if (!checkInTime || !shiftStart) return "ABSENT";

  const diffMs = checkInTime.getTime() - shiftStart.getTime();
  const diffMin = diffMs / MINUTE_MS;

  if (diffMin <= -0.01 && diffMin >= -20) {
    return "EARLY_CHECKIN";
  }

  if (Math.abs(diffMin) < 0.1) {
    return "PRESENT";
  }

  if (diffMin > 0 && diffMin <= 10) {
    return "LATE";
  }

  if (diffMin > 30) {
    return "ABSENT";
  }

  return "PRESENT";
}

export function resolveCheckOutStatus(checkOutTime, shiftEnd, hasEarlyRequest = false) {
  if (hasEarlyRequest) return "EARLY_CHECKOUT";
  if (!checkOutTime || !shiftEnd) return null;

  const diffMs = checkOutTime.getTime() - shiftEnd.getTime();
  const diffMin = diffMs / MINUTE_MS;

  if (diffMin <= 0) {
    return "NORMAL";
  }

  if (diffMin > 0 && diffMin <= 20) {
    return "OVERTIME";
  }

  if (diffMin > 20) {
    return "FORGOT_CHECKOUT";
  }

  return "NORMAL";
}

export function getAttendanceLabel(checkInStatus, checkOutStatus) {
  if (checkInStatus === "PRESENT" || checkInStatus === "EARLY_CHECKIN") {
    if (checkOutStatus === "NORMAL") return "ON_TIME";
  }
  if (checkInStatus === "LATE") return "LATE";
  if (checkInStatus === "ABSENT") return "ABSENT";

  if (checkInStatus === "LEAVE") return "LEAVE";
  if (checkInStatus === "PERMISSION") return "PERMISSION";

  if (checkOutStatus === "EARLY_CHECKOUT") return "EARLY_CHECKOUT";
  if (checkOutStatus === "FORGOT_CHECKOUT") return "FORGOT_CHECKOUT";
  if (checkOutStatus === "OVERTIME") return "Overtime";


  return checkInStatus || "Unknown";
}

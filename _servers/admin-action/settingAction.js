import { prisma } from "@/_lib/prisma"

export async function getAttendanceConfig() {
  const config = await prisma.attendancePolicyConfig.findFirst()
  return config ?? {
    lateThresholdMinutes: 10,
    absentThresholdMinutes: 20,
    checkinEarlyWindow: 20,
    checkoutEarlyMargin: 5,
    forgotCheckoutReminder: 20,
  }
}

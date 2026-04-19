import { prisma } from "@/_lib/prisma"

/**
 * Automates the checking of orphaned check-ins or forgotten check-ins.
 * This should ideally run hourly via a cron job or scheduled API route.
 */
export async function runAttendanceSweeper() {
  const now = new Date()
  
  try {
    // Cut-off time to auto-close: 2 hours ago
    // Any shift that finished more than 2 hours ago but user hasn't checked out yet.
    const cutoffDate = new Date(now.getTime() - 2 * 60 * 60 * 1000)

    // 1. Resolve forgotten check-out (Orphaned Check-in)
    // Find attendances that have a check-in but no check-out
    const openAttendances = await prisma.attendance.findMany({
      where: {
        checkInTime: { not: null },
        checkOutTime: null,
      },
      include: {
        shift: true,
      },
    })

    const updatePromises = []

    for (const att of openAttendances) {
      if (!att.shift) continue

      // Calculate shift actual end date/time based on the attendance date
      // Assuming shift.endTime is minutes from 00:00 (e.g., 1020 for 17:00)
      const shiftDate = new Date(att.date)
      const endHours = Math.floor(att.shift.endTime / 60)
      const endMinutes = att.shift.endTime % 60
      
      const shiftEndTarget = new Date(shiftDate.setHours(endHours, endMinutes, 0, 0))

      // If the current time is past the allowed cutoff (shiftEndTarget + 2 hours buffer)
      if (now > new Date(shiftEndTarget.getTime() + 2 * 60 * 60 * 1000)) {
        updatePromises.push(
          prisma.attendance.update({
            where: { id: att.id },
            data: {
              checkOutTime: shiftEndTarget,
              status: "ABSENT", // Or you can keep PRESENT and add an adminReason
              adminReason: "System forced check-out due to abandonment.",
            },
          })
        )
      }
    }

    // 2. Mark ABSENT for users who never checked in today
    // We check for the current date (start of day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Get all active users with a shift
    const activeUsers = await prisma.user.findMany({
      where: { isActive: true, shiftId: { not: null } },
      select: { id: true, shiftId: true, shift: true }
    })

    // Get all attendances created today
    const todaysAttendances = await prisma.attendance.findMany({
      where: { date: today },
      select: { userId: true }
    })
    const checkedInUserIds = new Set(todaysAttendances.map(a => a.userId))

    const absentPromises = []
    
    for (const user of activeUsers) {
      // If user hasn't made an attendance record today
      if (!checkedInUserIds.has(user.id) && user.shift) {
        
        // Ensure the shift hasn't just started, we only auto-absent if shift is basically over.
        const endHours = Math.floor(user.shift.endTime / 60)
        const shiftEndTarget = new Date(today.setHours(endHours, 0, 0, 0))
        
        if (now > shiftEndTarget) {
          absentPromises.push(
            prisma.attendance.create({
              data: {
                userId: user.id,
                date: today,
                shiftId: user.shiftId,
                status: "ABSENT",
                adminReason: "Auto-marked absent (No scan detected)",
              }
            })
          )
        }
      }
    }

    // Execute database updates
    let updatedOrphans = 0
    let addedAbsents = 0

    if (updatePromises.length > 0) {
      await prisma.$transaction(updatePromises)
      updatedOrphans = updatePromises.length
    }
    
    if (absentPromises.length > 0) {
      await prisma.$transaction(absentPromises)
      addedAbsents = absentPromises.length
    }

    console.log(`Sweeper finished: ${updatedOrphans} forced check-outs, ${addedAbsents} auto-absents.`)
    return { success: true, updatedOrphans, addedAbsents }

  } catch (err) {
    console.error("Attendance Sweeper Error:", err)
    return { success: false, error: err.message }
  }
}

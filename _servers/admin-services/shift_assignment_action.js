"use server"

import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { revalidatePath } from "next/cache"
import { parseISO, startOfDay, addDays } from "date-fns"

// Helper to check admin
async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERVISOR")) {
    throw new Error("Unauthorized: Only Admins/Supervisors can perform this action.")
  }
  return user
}

/**
 * Create or Update a single shift assignment
 */
export async function createOrUpdateShiftAssignment(data) {
  try {
    await requireAdmin()
    
    const { userId, date, shiftId, isLeave = false, isManualOverride = false } = data
 
    if (!userId || !date || shiftId === undefined || shiftId === null) {
      throw new Error("Missing required fields: userId, date, and shiftId are mandatory.")
    }

    // [STRICT LOCATION RULE]
    // Fetch user and shift location to validate
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { locationId: true }
    })

    if (!targetUser) throw new Error("User not found.")

    const targetShift = await prisma.shift.findUnique({
      where: { id: shiftId },
      select: { locationId: true }
    })

    if (!targetShift) throw new Error("Shift not found.")

    if (targetUser.locationId !== targetShift.locationId) {
      throw new Error("Shift tidak tersedia di lokasi user")
    }

    const targetDate = startOfDay(new Date(date))

    // Use upsert to handle the unique [userId, date] constraint automatically
    const assignment = await prisma.shiftAssignment.upsert({
      where: {
        userId_date: {
          userId,
          date: targetDate
        }
      },
      update: {
        shiftId,
        isLeave,
        isManualOverride
      },
      create: {
        userId,
        date: targetDate,
        shiftId,
        isLeave,
        isManualOverride
      }
    })

    revalidatePath(`/admin/dashboard/shift-assignments/${userId}`)
    return { success: true, data: assignment }
  } catch (error) {
    console.error("Error saving shift assignment:", error)
    return { success: false, error: error.message || "Failed to save shift assignment" }
  }
}

/**
 * Delete a single shift assignment
 */
export async function deleteShiftAssignment(assignmentId, userId) {
  try {
    await requireAdmin()

    await prisma.shiftAssignment.delete({
      where: { id: parseInt(assignmentId) }
    })

    if (userId) {
      revalidatePath(`/admin/dashboard/shift-assignments/${userId}`)
    }
    return { success: true }
  } catch (error) {
    console.error("Error deleting shift assignment:", error)
    return { success: false, error: error.message || "Failed to delete shift assignment" }
  }
}

/**
 * Bulk assign shifts using a rotation pattern over a date range
 */
export async function bulkAssignShift(data) {
  try {
    await requireAdmin()

    const { userId, startDate, endDate, shiftPattern } = data

    if (!userId || !startDate || !endDate || !shiftPattern || !shiftPattern.length) {
      throw new Error("Missing required fields or empty pattern.")
    }

    // [STRICT LOCATION RULE]
    // Fetch user location
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { locationId: true }
    })
    if (!targetUser) throw new Error("User not found.")

    // Fetch all shifts in the pattern to validate their locations
    const uniqueShiftIds = [...new Set(shiftPattern.filter(id => id !== null && id !== undefined))]
    const targetShifts = await prisma.shift.findMany({
      where: { id: { in: uniqueShiftIds.map(id => parseInt(id)) } },
      select: { id: true, locationId: true }
    })

    // Check if any shift belongs to a different location
    const invalidShifts = targetShifts.filter(s => s.locationId !== targetUser.locationId)
    if (invalidShifts.length > 0 || targetShifts.length < uniqueShiftIds.length) {
      throw new Error("Shift tidak tersedia di lokasi user")
    }

    const start = startOfDay(new Date(startDate))
    const end = startOfDay(new Date(endDate))

    if (start > end) {
      throw new Error("Start date must be before or equal to End date.")
    }

    // We will do this in a transaction
    const operations = []
    
    let currentDate = start
    let patternIndex = 0

    while (currentDate <= end) {
      const shiftId = shiftPattern[patternIndex % shiftPattern.length]

      if (shiftId !== null && shiftId !== undefined) {
        operations.push(
          prisma.shiftAssignment.upsert({
            where: {
              userId_date: {
                userId,
                date: currentDate
              }
            },
            update: {
              shiftId,
              isManualOverride: true
            },
            create: {
              userId,
              date: currentDate,
              shiftId,
              isManualOverride: true
            }
          })
        )
      }

      currentDate = addDays(currentDate, 1)
      patternIndex++
    }

    await prisma.$transaction(operations)

    revalidatePath(`/admin/dashboard/shift-assignments/${userId}`)
    return { success: true, count: operations.length }
  } catch (error) {
    console.error("Error bulk assigning shifts:", error)
    return { success: false, error: error.message || "Failed to bulk assign shifts" }
  }
}

/**
 * Delete multiple shift assignments by dates
 */
export async function deleteMultipleShiftAssignments(dates, userId) {
  try {
    await requireAdmin()
    if (!userId || !dates || !dates.length) {
      throw new Error("Missing required fields: userId and dates.")
    }

    const targetDates = dates.map(d => startOfDay(new Date(d)))

    await prisma.shiftAssignment.deleteMany({
      where: {
        userId,
        date: { in: targetDates }
      }
    })

    revalidatePath(`/admin/dashboard/shift-assignments/${userId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting multiple shift assignments:", error)
    return { success: false, error: error.message || "Failed to delete shifts" }
  }
}

/**
 * Delete all shift assignments for a user
 */
export async function deleteAllAssignments(userId) {
  try {
    await requireAdmin()
    if (!userId) throw new Error("User ID is required.")

    await prisma.shiftAssignment.deleteMany({
      where: { userId }
    })

    revalidatePath(`/admin/dashboard/shift-assignments/${userId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting all assignments:", error)
    return { success: false, error: error.message || "Failed to delete all assignments" }
  }
}

/**
 * Bulk assign shifts using a preset (list of dates)
 */
export async function bulkAssignPreset({ userId, dates, shiftId }) {
  try {
    await requireAdmin()
    if (!userId || !dates || !dates.length || !shiftId) {
      throw new Error("Missing required fields.")
    }

    // [STRICT LOCATION RULE]
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { locationId: true }
    })
    if (!targetUser) throw new Error("User not found.")

    const targetShift = await prisma.shift.findUnique({
      where: { id: shiftId },
      select: { locationId: true }
    })
    if (!targetShift || targetShift.locationId !== targetUser.locationId) {
      throw new Error("Shift tidak tersedia di lokasi user")
    }

    const operations = dates.map(dateStr => {
      const targetDate = startOfDay(new Date(dateStr))
      return prisma.shiftAssignment.upsert({
        where: {
          userId_date: {
            userId,
            date: targetDate
          }
        },
        update: {
          shiftId,
          isManualOverride: true
        },
        create: {
          userId,
          date: targetDate,
          shiftId,
          isManualOverride: true
        }
      })
    })

    await prisma.$transaction(operations)

    revalidatePath(`/admin/dashboard/shift-assignments/${userId}`)
    return { success: true, count: operations.length }
  } catch (error) {
    console.error("Error bulk assigning preset:", error)
    return { success: false, error: error.message || "Failed to assign preset" }
  }
}

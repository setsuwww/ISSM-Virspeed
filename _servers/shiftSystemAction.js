import { prisma } from "@/_lib/prisma"

/**
 * Automates shift rotation for all users based on their location.
 * The rotation follows the order of the shifts' start times within each location.
 * For example: Morning -> Afternoon -> Evening -> Morning.
 *
 * This function can be called by a cron job every 2 weeks or via a manual trigger.
 */
export async function autoRotateShifts() {
  try {
    // Fetch all locations that have at least one shift and one user
    const locations = await prisma.location.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        shifts: {
          where: { isActive: true, type: { not: "OFF" } },
          orderBy: { startTime: "asc" },
        },
        users: {
          where: { isLocked: false, shiftId: { not: null } },
          select: { id: true, shiftId: true },
        },
      },
    })

    const updatePromises = []

    for (const location of locations) {
      if (location.shifts.length <= 1 || location.users.length === 0) {
        // If a location has 1 or fewer shifts, rotation isn't possible/needed
        continue
      }

      const shifts = location.shifts
      const shiftCount = shifts.length

      for (const user of location.users) {
        // Find the index of the user's current shift
        const currentShiftIndex = shifts.findIndex((s) => s.id === user.shiftId)

        if (currentShiftIndex !== -1) {
          // Calculate the next shift index
          const nextShiftIndex = (currentShiftIndex + 1) % shiftCount
          const nextShift = shifts[nextShiftIndex]

          // Prepare the update operation
          updatePromises.push(
            prisma.user.update({
              where: { id: user.id },
              data: { shiftId: nextShift.id },
            })
          )
        }
      }
    }

    if (updatePromises.length > 0) {
      // Execute all updates inside a transaction
      await prisma.$transaction(updatePromises)
      console.log(`Successfully rotated shifts for ${updatePromises.length} users.`)
    } else {
      console.log("No users needed a shift rotation at this time.")
    }

    return { success: true, count: updatePromises.length }
  } catch (error) {
    console.error("Error auto-rotating shifts:", error)
    return { success: false, error: error.message }
  }
}

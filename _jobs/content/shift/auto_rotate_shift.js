import { getNextShiftIndex, getShiftByIndex, getLastRotationIndex } from "./auto_rotate_shift_helpers"

export function generateUserShiftAssignments({
    userId,
    existingAssignments,
    startDate,
    totalDays,
    leaveDates = [],
    manualOverrideDates = []
}) {
    const results = []

    let index = getLastRotationIndex(existingAssignments)

    for (let i = 0; i < totalDays; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)

        const dateStr = date.toISOString().split("T")[0]

        // 🚫 skip leave
        if (leaveDates.includes(dateStr)) {
            results.push({
                userId,
                date,
                shiftId: null,
                isLeave: true,
            })
            continue
        }

        // 🚫 skip manual override
        if (manualOverrideDates.includes(dateStr)) {
            continue
        }

        index = getNextShiftIndex(index)
        const shiftId = getShiftByIndex(index)

        results.push({
            userId,
            date,
            shiftId: shiftId === 0 ? null : shiftId,
            isLeave: false,
        })
    }

    return results
}

import { useEffect, useState } from "react"

/**
 * Parses time stored as total minutes from midnight (e.g., 960 for 16:00)
 * @param {number} minutes
 */
function parseTimeMinutes(minutes) {
    if (minutes === undefined || minutes === null) return { hour: 0, minute: 0 }

    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60

    return { hour, minute }
}

export function useCheckoutTimer(workStart, shiftStart, shiftEnd) {
    const [now, setNow] = useState(Date.now())

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(interval)
    }, [])

    if (!workStart) {
        return {
            elapsed: 0,
            remaining: 0,
            progress: 0,
            isOvertime: false,
        }
    }

    const startShiftTime = parseTimeMinutes(shiftStart)
    const endShiftTime = parseTimeMinutes(shiftEnd)

    const nowDate = new Date(now)

    // 1. Use current local date as base for shiftStartDate and shiftEndDate
    let shiftStartDate = new Date(nowDate)
    shiftStartDate.setHours(startShiftTime.hour, startShiftTime.minute, 0, 0)

    let shiftEndDate = new Date(nowDate)
    shiftEndDate.setHours(endShiftTime.hour, endShiftTime.minute, 0, 0)

    // 2. Handle night shift (end < start) by adding 1 day to shiftEndDate
    if (shiftEnd < shiftStart) {
        shiftEndDate.setDate(shiftEndDate.getDate() + 1)
    }

    // 3. Add fallback: If current time is significantly before shiftStartDate,
    // assume shift belongs to previous day and subtract 1 day from both.
    // This typically happens for night shifts or very late shifts being viewed after midnight.
    // We use a 6-hour buffer to avoid moving today's early morning check-ins to yesterday.
    const SIX_HOURS = 6 * 60 * 60 * 1000
    if (now < (shiftStartDate.getTime() - SIX_HOURS)) {
        shiftStartDate.setDate(shiftStartDate.getDate() - 1)
        shiftEndDate.setDate(shiftEndDate.getDate() - 1)
    }

    const startTimestamp = new Date(workStart).getTime()
    const nowTimestamp = now

    // 4. Ensure isOvertime = now > shiftEndDate
    const isOvertime = nowTimestamp > shiftEndDate.getTime()

    // 5. Ensure remaining never negative unless truly overtime
    const remaining = isOvertime ? 0 : Math.max(0, shiftEndDate.getTime() - nowTimestamp)

    const elapsed = Math.max(0, nowTimestamp - startTimestamp)

    // Progress calculation
    // effectiveStart is when the "progress" starts counting (either check-in time or shift start time)
    const effectiveStart = Math.max(startTimestamp, shiftStartDate.getTime())
    const totalDuration = shiftEndDate.getTime() - effectiveStart

    let progress = 0
    if (totalDuration > 0) {
        progress = Math.min(((nowTimestamp - effectiveStart) / totalDuration) * 100, 100)
        progress = Math.max(0, progress)
    } else if (isOvertime) {
        progress = 100
    }

    return {
        elapsed,
        remaining,
        progress,
        isOvertime,
    }
}

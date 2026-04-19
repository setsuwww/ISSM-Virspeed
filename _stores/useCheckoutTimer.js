import { useEffect, useState } from "react"

function parseTimeInt(time) {
    if (!time) return { hour: 0, minute: 0 }

    const str = time.toString().padStart(4, "0")

    return {
        hour: Number(str.slice(0, 2)),
        minute: Number(str.slice(2, 4)),
    }
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

    const start = new Date(workStart).getTime()
    const endDate = new Date(workStart)

    const startShift = parseTimeInt(shiftStart)
    const endShift = parseTimeInt(shiftEnd)

    if (endShift.hour < startShift.hour) {
        endDate.setDate(endDate.getDate() + 1)
    }

    endDate.setHours(endShift.hour, endShift.minute, 0, 0)

    const elapsed = now - start
    const remaining = endDate.getTime() - now
    const total = endDate.getTime() - start

    const progress = total > 0
        ? Math.min((elapsed / total) * 100, 100)
        : 0

    return {
        elapsed,
        remaining,
        progress,
        isOvertime: remaining < 0,
    }
}

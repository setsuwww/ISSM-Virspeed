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

    const nowDate = new Date(now)

    const startShift = parseTimeInt(shiftStart)
    const endShift = parseTimeInt(shiftEnd)

    const shiftStartDate = new Date(nowDate)
    shiftStartDate.setHours(startShift.hour, startShift.minute, 0, 0)

    const shiftEndDate = new Date(nowDate)
    shiftEndDate.setHours(endShift.hour, endShift.minute, 0, 0)

    // handle shift malam
    if (endShift.hour < startShift.hour) {
        shiftEndDate.setDate(shiftEndDate.getDate() + 1)
    }

    // elapsed dari check-in
    const start = new Date(workStart).getTime()

    const elapsed = now - start
    const remaining = shiftEndDate.getTime() - now
    const total = shiftEndDate.getTime() - start

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

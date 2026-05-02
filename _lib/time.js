import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

export const TZ = "Asia/Jakarta"
export const MINUTE_MS = 60_000

export function getNowJakarta() {
  return dayjs().tz(TZ)
}

export function getTodayStartJakarta() {
  return getNowJakarta().startOf("day")
}

export function parseJakarta(date) {
  if (!date) return null
  return dayjs(date).tz(TZ)
}

export function formatJakarta(date, formatStr = "yyyy-MM-dd") {
  const d = parseJakarta(date)
  return d ? d.format(formatStr) : ""
}

export function minutesToTodayTime(minutes) {
  return getTodayStartJakarta().add(minutes, "minute")
}

export function minutesToDateTime(date, minutes) {
  return dayjs(date).tz(TZ).startOf("day").add(minutes, "minute")
}

/**
 * Gets the start of the month, the end of the month, and all days in between
 * strictly in Asia/Jakarta timezone.
 */
export function getJakartaMonthDetails(date) {
  const base = parseJakarta(date).startOf("month")
  const start = base.clone().startOf("month")
  const end = base.clone().endOf("month")
  
  const days = []
  let curr = start.clone()
  while (curr.isBefore(end) || curr.isSame(end, 'day')) {
    days.push(curr.clone().toDate())
    curr = curr.add(1, "day")
  }

  return {
    start,
    end,
    days,
    firstDayOfWeek: start.day() // 0 = Sunday, 1 = Monday, etc.
  }
}

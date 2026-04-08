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

export function minutesToTodayTime(minutes) {
  return getTodayStartJakarta().add(minutes, "minute")
}

export function minutesToDateTime(date, minutes) {
  return dayjs(date).tz(TZ).startOf("day").add(minutes, "minute")
}

import { minutesToTime } from "@/_functions/globalFunction"

export function getWorkHours(shift, location) {
  const start = shift?.startTime ?? location?.startTime ?? null
  const end = shift?.endTime ?? location?.endTime ?? null

  return {
    startTime: start,
    endTime: end,
    label:
      start != null && end != null
        ? `${minutesToTime(start)} - ${minutesToTime(end)}`
        : "-",
  }
}

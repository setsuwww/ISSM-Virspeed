import { minutesToTime } from "@/_functions/globalFunction"

export function getWorkHours(shift, division) {
  const start = shift?.startTime ?? division?.startTime ?? null
  const end = shift?.endTime ?? division?.endTime ?? null

  return {
    startTime: start,
    endTime: end,
    label:
      start != null && end != null
        ? `${minutesToTime(start)} - ${minutesToTime(end)}`
        : "-",
  }
}

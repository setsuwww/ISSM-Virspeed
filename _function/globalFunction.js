import { format } from "date-fns";
import { id } from "date-fns/locale";

export const capitalize = (str) =>
  typeof str === "string" && str.length
    ? str[0].toUpperCase() + str.slice(1).toLowerCase()
    : "";

export const safeToISOString = (v) => {
  const d = v ? new Date(v) : null;
  return d && !isNaN(d) ? d.toISOString() : null;
};

export const safeFormat = (v, fmt) => {
  const d = v ? new Date(v) : null;
  return d && !isNaN(d) ? format(d, fmt, { locale: id }) : "-";
};

export function formatIntToTime(hourInt) {
  if (hourInt == null) return ""
  const h = Math.floor(hourInt / 100)
  const m = hourInt % 100
  const hh = h.toString().padStart(2, "0")
  const mm = m.toString().padStart(2, "0")
  return `${hh}:${mm}`
}

export function formattimeToMinutes(time) {
  if (!time) return null
  const [h, m] = time.split(":").map(Number)
  return h * 100 + m
}

export function timeToMinutes(time) {
  if (!time || typeof time !== "string" || !time.includes(":")) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes) {
  if (minutes === null || minutes === undefined) return ""
  const h = Math.floor(minutes / 60).toString().padStart(2, "0")
  const m = (minutes % 60).toString().padStart(2, "0")
  return `${h}:${m}`
}

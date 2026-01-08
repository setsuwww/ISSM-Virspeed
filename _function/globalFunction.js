import { format } from "date-fns";
import { enUS } from "date-fns/locale";

export const capitalize = (s) => typeof s === "string" && s.length ? s[0].toUpperCase() + s.slice(1).toLowerCase() : "";

export const wordsLimit = (text, words = 10, end = "...") => {
  if (typeof text !== "string" || !text.trim()) return "-";

  const arr = text.trim().split(/\s+/);

  if (arr.length <= words) return text;

  return arr.slice(0, words).join(" ") + end;
};

export const safeToISOString = (v) => {
  const d = v ? new Date(v) : null;
  return d && !isNaN(d) ? d.toISOString() : null;
};

export const safeFormat = (v, fmt) => {
  const d = v ? new Date(v) : null;
  return d && !isNaN(d) ? format(d, fmt, { locale: enUS }) : "-";
};

export function formatIntToTime(hI) {
  if (hI == null) return ""
  const h = Math.floor(hI / 100)
  const m = hI % 100
  const hh = h.toString().padStart(2, "0")
  const mm = m.toString().padStart(2, "0")
  return `${hh}:${mm}`
}

export function formattimeToMinutes(t) {
  if (!t) return null
  const [h, m] = t.split(":").map(Number)
  return h * 100 + m
}

export function timeToMinutes(t) {
  if (!t || typeof t !== "string" || !t.includes(":")) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(min) {
  if (min === null || min === undefined) return ""
  const h = Math.floor(min / 60).toString().padStart(2, "0")
  const m = (min % 60).toString().padStart(2, "0")
  return `${h}:${m}`
}

export const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "?";

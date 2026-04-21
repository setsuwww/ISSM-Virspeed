import { prisma } from "@/_lib/prisma";
import { getNowJakarta, minutesToDateTime, MINUTE_MS } from "@/_lib/time";

const OPEN_THRESHOLD_MINUTES = 20;
const EARLY_THRESHOLD_MINUTES = 10;
const ABSENT_THRESHOLD_MINUTES = 20;

export function getDistanceMeters(pointA, pointB) {
    const R = 6371000;

    const lat1 = (pointA.lat * Math.PI) / 180;
    const lat2 = (pointB.lat * Math.PI) / 180;
    const dLat = ((pointB.lat - pointA.lat) * Math.PI) / 180;
    const dLon = ((pointB.lon - pointA.lon) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isUserWithinLocation(location, coords) {
    if (!location?.latitude || !location?.longitude) return false;
    if (!coords) return false;

    const lat = coords.lat ?? coords.latitude;
    const lon = coords.lon ?? coords.longitude;

    if (lat == null || lon == null) return false;

    const distance = getDistanceMeters(
        { lat: location.latitude, lon: location.longitude },
        { lat, lon }
    );

    return distance <= location.radius;
}

export function evaluateAttendancePolicy({ location, currentCoords }) {
    if (!location) {
        return { allowed: false, save: false, message: "Location tidak ditemukan" };
    }

    if (location.status === "INACTIVE") {
        return {
            allowed: true,
            save: false,
            toast: "Divisi nonaktif, check-in tetap dicatat.",
        };
    }

    if (location.type === "WFA") {
        return { allowed: true, save: true, ignoreLocation: true };
    }

    if (location.type === "WFO") {
        const valid = isUserWithinLocation(location, currentCoords);

        if (!valid) {
            return {
                allowed: false,
                save: false,
                message: "Lokasi terlalu jauh dari kantor.",
            };
        }

        return { allowed: true, save: true, ignoreLocation: false };
    }

    return {
        allowed: false,
        save: false,
        message: "Konfigurasi lokasi tidak valid",
    };
}

export async function determineAttendanceStatus({ shiftId, locationId, assignmentDate }) {
    let workHours = null;

    if (shiftId) {
        const shift = await prisma.shift.findUnique({
            where: { id: shiftId },
            select: { startTime: true, endTime: true },
        });
        if (shift) workHours = shift;
    }

    if (!workHours && locationId) {
        const location = await prisma.location.findUnique({
            where: { id: locationId },
            select: { startTime: true, endTime: true },
        });
        if (location?.startTime != null && location?.endTime != null) {
            workHours = location;
        }
    }

    if (!workHours) return "PRESENT";

    const now = getNowJakarta();
    const start = minutesToDateTime(assignmentDate, workHours.startTime);

    const isCrossDay = workHours.endTime < workHours.startTime;

    const end = isCrossDay
        ? minutesToDateTime(assignmentDate, workHours.endTime).add(1, "day")
        : minutesToDateTime(assignmentDate, workHours.endTime);

    // Difference in milliseconds
    const diffMs = now.diff(start);
    const diffMin = diffMs / MINUTE_MS;

    // Too early: Before 20 minutes from start
    if (diffMin < -OPEN_THRESHOLD_MINUTES) {
        throw new Error("Belum waktu check-in.");
    }

    // After shift ended
    if (now.isAfter(end)) {
        throw new Error("Shift sudah berakhir.");
    }

    // Status logic
    if (diffMin < 0) {
        // Within 10 mins before start
        return "EARLY_CHECKIN";
    }

    if (diffMin === 0) {
        return "PRESENT";
    }

    if (diffMin <= ABSENT_THRESHOLD_MINUTES) {
        // Between 0 and 20 mins after start
        return "LATE";
    }

    return "ABSENT";
}

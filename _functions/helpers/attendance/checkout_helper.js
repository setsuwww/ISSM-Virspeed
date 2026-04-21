import { prisma } from "@/_lib/prisma";
import { getNowJakarta, minutesToDateTime, MINUTE_MS } from "@/_lib/time";

const CHECKOUT_EARLY_WINDOW_MINUTES = 10;

export async function isEarlyCheckout(shiftId, checkoutTime, date = new Date()) {
    const shift = await prisma.shift.findUnique({
        where: { id: shiftId },
        select: { startTime: true, endTime: true },
    });

    if (!shift) return false;

    const isCrossDay = shift.endTime < shift.startTime;

    const end = isCrossDay
        ? minutesToDateTime(date, shift.endTime).add(1, "day")
        : minutesToDateTime(date, shift.endTime);

    const checkout = getNowJakarta(checkoutTime);

    // Return true if checkout is before shift end
    return checkout.isBefore(end);
}

export async function canUserCheckout(shiftId, date = new Date()) {
    const shift = await prisma.shift.findUnique({
        where: { id: shiftId },
        select: { startTime: true, endTime: true },
    });

    if (!shift) return false;

    const now = getNowJakarta();

    const isCrossDay = shift.endTime < shift.startTime;

    const end = isCrossDay
        ? minutesToDateTime(date, shift.endTime).add(1, "day")
        : minutesToDateTime(date, shift.endTime);

    // Enabled if it's within the 10-minute window before end OR after end
    const diffMin = end.diff(now) / MINUTE_MS;

    return diffMin <= CHECKOUT_EARLY_WINDOW_MINUTES;
}

/**
 * Returns a warning message if checkout is performed within the 10-minute early window.
 */
export function getCheckoutWarning(shiftEnd, now = getNowJakarta()) {
    const diffMin = shiftEnd.diff(now) / MINUTE_MS;

    if (diffMin > 0 && diffMin <= CHECKOUT_EARLY_WINDOW_MINUTES) {
        return "Shift anda belum Berakhir, Urgent? Kirim request Early Checkout sekarang";
    }

    return null;
}

import { prisma } from "@/_lib/prisma";
import { getCurrentUser } from "@/_lib/auth";
import { getNowJakarta } from "@/_lib/time";
import { calculateShiftEndTime, calculateWorkMinutes } from "../calculateShift";

const REMINDER_MINUTES = 20;

export function shouldRemindForgotCheckout(attendance) {
    if (!attendance?.checkInTime || attendance.checkOutTime) return false;

    const now = getNowJakarta();
    const checkIn = getNowJakarta(attendance.checkInTime);

    return now.diff(checkIn) >= REMINDER_MINUTES * 60000;
}

export async function checkForgotCheckoutStatus() {
    const user = await getCurrentUser();
    if (!user?.id) return { hasForgotCheckout: false };

    const now = getNowJakarta();

    const attendance = await prisma.attendance.findFirst({
        where: {
            userId: user.id,
            checkInTime: { not: null },
            checkOutTime: null,
        },
        include: { shift: true },
        orderBy: { date: "desc" },
    });

    if (!attendance || !attendance.shift) {
        return { hasForgotCheckout: false };
    }

    const shiftEnd = calculateShiftEndTime(attendance.date, attendance.shift);

    // 2-hour threshold
    const limit = new Date(shiftEnd);
    limit.setHours(limit.getHours() + 2);

    const isForgot = now.toDate() > limit;

    const lateMinutes = Math.max(
        0,
        Math.floor((now.toDate() - shiftEnd) / 60000)
    );

    return {
        hasForgotCheckout: isForgot,
        attendanceId: attendance.id,
        lateMinutes,
        isShiftEnded: now.toDate() > shiftEnd,
    };
}

export async function autoCheckoutUser(attendanceId) {
    const user = await getCurrentUser();
    if (!user?.id) return { success: false };

    const attendance = await prisma.attendance.findUnique({
        where: { id: attendanceId },
        include: { shift: true },
    });

    if (!attendance || attendance.checkOutTime) {
        return { success: false };
    }

    const shiftEnd = calculateShiftEndTime(attendance.date, attendance.shift);

    const autoTime = new Date(shiftEnd);
    autoTime.setHours(autoTime.getHours() + 2);

    const workMinutes = calculateWorkMinutes(
        attendance.checkInTime,
        autoTime
    );

    await prisma.attendance.update({
        where: { id: attendanceId },
        data: {
            checkOutTime: autoTime,
            workMinutes: workMinutes || 0,
            status: "FORGOT_CHECKOUT",
        },
    });

    return { success: true };
}

export async function batchAutoCheckout() {
    const now = getNowJakarta();

    const list = await prisma.attendance.findMany({
        where: {
            checkInTime: { not: null },
            checkOutTime: null,
        },
        include: { shift: true },
    });

    let processed = 0;

    for (const a of list) {
        const shiftEnd = calculateShiftEndTime(a.date, a.shift);

        const limit = new Date(shiftEnd);
        limit.setHours(limit.getHours() + 2);

        if (now.toDate() > limit) {
            const workMinutes = calculateWorkMinutes(a.checkInTime, limit);

            await prisma.attendance.update({
                where: { id: a.id },
                data: {
                    checkOutTime: limit,
                    workMinutes: workMinutes || 0,
                    status: "FORGOT_CHECKOUT",
                },
            });

            processed++;
        }
    }

    return { processed };
}

export function isForgotCheckoutEligible(attendance, shift) {
    if (!attendance?.checkInTime || attendance.checkOutTime) return false;

    const end = calculateShiftEndTime(attendance.date, shift);

    const limit = new Date(end);
    limit.setHours(limit.getHours() + 2);

    return getNowJakarta().toDate() > limit;
}

export function getForgotCheckoutDeadline(attendance, shift) {
    if (!attendance?.checkInTime || attendance.checkOutTime) return null;

    const end = calculateShiftEndTime(attendance.date, shift);

    const deadline = new Date(end);
    deadline.setHours(deadline.getHours() + 2);

    return deadline;
}

export function getForgotCheckoutWarning(minutes, ended) {
    if (!ended) return null;

    if (minutes >= 120) return "Auto checkout akan dilakukan.";
    if (minutes >= 60) return "Segera checkout sebelum auto.";
    if (minutes >= 30) return "Jangan lupa checkout!";
    if (minutes >= 1) return "Shift sudah selesai.";

    return null;
}

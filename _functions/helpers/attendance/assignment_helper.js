import { prisma } from "@/_lib/prisma";
import { getTodayStartJakarta } from "@/_lib/time";

export async function getActiveAssignment(userId) {
    const today = getTodayStartJakarta().toDate();

    return prisma.shiftAssignment.findFirst({
        where: {
            userId,
            date: today,
        },
        include: {
            shift: {
                include: { location: true },
            },
        },
    });
}

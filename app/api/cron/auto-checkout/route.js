import { NextResponse } from "next/server";
import { prisma } from "@/_lib/prisma";
import { batchAutoCheckout } from "@/_functions/helpers/attendanceServerHelpers";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        // Jika ada userId, maka return status khusus user tersebut (untuk modal/warning)
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    location: true,
                    shift: true,
                }
            });

            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            const attendance = await prisma.attendance.findFirst({
                where: {
                    userId,
                    checkOutTime: null,
                },
                include: {
                    shift: true,
                    assignment: {
                        include: { shift: true }
                    }
                },
                orderBy: { date: "desc" }
            });

            let shiftData = null;
            let activeShift = attendance?.shift || attendance?.assignment?.shift;

            if (activeShift) {
                shiftData = {
                    id: activeShift.id,
                    name: activeShift.name,
                    startTime: activeShift.startTime,
                    endTime: activeShift.endTime,
                    type: "SHIFT_ASSIGNMENT"
                };
            }

            return NextResponse.json({
                shift: shiftData,
                attendance: attendance
                    ? {
                        id: attendance.id,
                        checkInTime: attendance.checkInTime,
                    }
                    : null,
            });
        }

        // Jika tidak ada userId, maka jalankan batch auto-checkout
        console.log("[CRON] Running batch auto-checkout...");
        const result = await batchAutoCheckout();
        
        return NextResponse.json({
            success: true,
            message: "Batch auto-checkout completed",
            processed: result.processed,
            results: result.results
        });

    } catch (error) {
        console.error("[CRON ERROR]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

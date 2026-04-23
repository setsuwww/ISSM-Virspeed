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

            const today = new Date();
            const assignment = await prisma.shiftAssignment.findUnique({
                where: {
                    userId_date: {
                        userId,
                        date: new Date(today.setHours(0, 0, 0, 0))
                    }
                },
                include: {
                    shift: true
                }
            });

            const attendance = await prisma.attendance.findFirst({
                where: {
                    userId,
                    checkOutTime: null,
                },
                orderBy: { date: "desc" }
            });

            let shiftData = null;
            if (assignment?.shift) {
                shiftData = {
                    id: assignment.shift.id,
                    name: assignment.shift.name,
                    startTime: assignment.shift.startTime,
                    endTime: assignment.shift.endTime,
                    type: "SHIFT_ASSIGNMENT"
                };
            } else if (user.shift) {
                shiftData = {
                    id: user.shift.id,
                    name: user.shift.name,
                    startTime: user.shift.startTime,
                    endTime: user.shift.endTime,
                    type: "SHIFT_USER"
                };
            } else if (user.location?.startTime != null) {
                shiftData = {
                    id: null,
                    name: user.location.name || "Normal Hours",
                    startTime: user.location.startTime,
                    endTime: user.location.endTime,
                    type: "NORMAL"
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

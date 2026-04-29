import { NextResponse } from "next/server"
import { prisma } from "@/_lib/prisma"

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get("userId")

        if (!userId) {
            return NextResponse.json(
                { error: "userId wajib diisi" },
                { status: 400 }
            )
        }

        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                checkOutTime: null,
            },
            include: {
                shift: {
                    include: {
                        location: true
                    }
                },
                shift: {
                    include: { location: true }
                },
                assignment: {
                    include: { shift: { include: { location: true } } }
                }
            },
            orderBy: {
                date: "desc",
            },
        })

        if (!attendance) {
            return NextResponse.json({
                shift: null,
                attendance: null,
            })
        }

        let shiftData = null

        // 🔥 PRIORITY 1: shift dari assignment atau attendance
        let activeShift = attendance.shift || attendance.assignment?.shift;

        if (activeShift) {
            shiftData = {
                id: activeShift.id,
                name: activeShift.name,
                startTime: activeShift.startTime,
                endTime: activeShift.endTime,
                type: "SHIFT",
            }
        }

        return NextResponse.json({
            shift: shiftData,
            attendance: {
                id: attendance.id,
                checkInTime: attendance.checkInTime,
            },
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

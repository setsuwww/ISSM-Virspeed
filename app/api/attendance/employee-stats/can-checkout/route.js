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

        // ambil attendance hari ini (yang masih aktif / belum checkout)
        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                checkOutTime: null, // masih aktif
            },
            include: {
                shift: true,
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

        return NextResponse.json({
            shift: {
                id: attendance.shift.id,
                name: attendance.shift.name,
                startTime: attendance.shift.startTime,
                endTime: attendance.shift.endTime,
            },
            attendance: {
                id: attendance.id,
                checkInTime: attendance.checkInTime,
            },
        })
        console.log("ATTENDANCE:", attendance)
    }
    catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
        console.log("ATTENDANCE:", attendance)
    }
}

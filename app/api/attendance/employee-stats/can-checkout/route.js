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
                user: {
                    include: {
                        location: true,
                        shift: {
                            include: {
                                location: true
                            }
                        }
                    }
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

        // 🔥 PRIORITY 1: shift dari attendance
        if (attendance.shift) {
            shiftData = {
                id: attendance.shift.id,
                name: attendance.shift.name,
                startTime: attendance.shift.startTime,
                endTime: attendance.shift.endTime,
                type: "SHIFT",
            }
        }

        // 🔥 PRIORITY 2: shift dari user (default shift)
        else if (attendance.user?.shift) {
            shiftData = {
                id: attendance.user.shift.id,
                name: attendance.user.shift.name,
                startTime: attendance.user.shift.startTime,
                endTime: attendance.user.shift.endTime,
                location: attendance.user.shift.location.name,
                type: "SHIFT",
            }
        }

        // 🔥 PRIORITY 3: fallback ke location (normal hours)
        else if (attendance.user?.location) {
            shiftData = {
                id: null,
                name: attendance.user.location.name || "Normal Hours",
                startTime: attendance.user.location.startTime,
                endTime: attendance.user.location.endTime,
                type: "NORMAL",
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

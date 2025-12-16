import { getCurrentUser } from "@/_lib/auth"
import { prisma } from "@/_lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { targetUserId, startDate, endDate, reason } = body

    if (!targetUserId || !startDate || !reason?.trim()) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: Number(targetUserId) },
    })

    if (!targetUser) {
      return NextResponse.json({ message: "Target user not found" }, { status: 404 })
    }

    if (!user.shiftId) {
      return NextResponse.json({ message: "You have no shift assigned" }, { status: 400 })
    }

    if (!targetUser.shiftId) {
      return NextResponse.json({ message: "Target user has no shift assigned" }, { status: 400 })
    }

    const changeRequest = await prisma.shiftChangeRequest.create({
      data: {
        userId: user.id,
        requestedById: user.id,
        targetUserId: targetUser.id,

        oldShiftId: user.shiftId,
        targetShiftId: targetUser.shiftId,

        reason: reason.trim(),

        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        user: true,
        targetUser: true,
        oldShift: true,
        targetShift: true,
      },
    })

    return NextResponse.json({
      success: true,
      changeRequest,
    })
  } catch (err) {
    console.error("POST /api/shifts/user-side-change error:", err)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

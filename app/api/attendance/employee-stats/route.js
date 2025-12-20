import { NextResponse } from "next/server"
import { prisma } from "@/_lib/prisma"

export async function GET(req) {
  try {
    // Ambil query userId
    const { searchParams } = new URL(req.url)
    const userId = parseInt(searchParams.get("userId"))

    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: "Invalid or missing userId" }, { status: 400 })
    }

    // Ambil semua attendance milik user itu
    const attendances = await prisma.attendance.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { userId },
    })

    const stats = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      PERMISSION: 0,
      ALPHA: 0,
    }

    attendances.forEach((a) => {
      stats[a.status] = a._count.status
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching attendance stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

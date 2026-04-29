import { generateNextShift } from "@/_jobs/content/shift/shift_generator"
import { prisma } from "@/_lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const users = await prisma.user.findMany({
        select: { id: true },
    })

    for (const user of users) {
        await generateNextShift(user.id)
    }

    return NextResponse.json({ success: true })
}

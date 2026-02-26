import { NextResponse } from "next/server"
import { prisma } from "@/_lib/prisma"

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q") || ""

    if (q.length < 2) {
        return NextResponse.json([])
    }

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { email: { contains: q } },
                { name: { contains: q } },
            ],
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
        take: 10,
    })

    return NextResponse.json(users)
}

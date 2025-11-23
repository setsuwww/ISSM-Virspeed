import { prisma } from "@/_lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
  const id = parseInt(params.id)

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      divisionId: true,
      shift: {
        select: { type: true },
      },
    },
  })

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  return NextResponse.json({
    ...user,
    shift: { type: user.shift?.type ?? "OFF" },
  })
}

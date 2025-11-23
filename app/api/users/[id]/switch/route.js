import { prisma } from "@/_lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
  const currentUserId = parseInt(params.id)

  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { divisionId: true },
  })

  if (!currentUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 })

  const rawUsers = await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
      role: "EMPLOYEE",
      divisionId: currentUser.divisionId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      shift: { select: { type: true } },
    },
  })

  const users = rawUsers.map((u) => ({
    ...u,
    shift: { type: u.shift?.type ?? "OFF" },
  }))

  return NextResponse.json(users)
}

export async function POST(req, { params }) {
  const currentUserId = parseInt(params.id)
  const { otherUserId } = await req.json()

  if (!otherUserId)
    return NextResponse.json({ error: "Target user missing" }, { status: 400 })

  const current = await prisma.user.findUnique({ where: { id: currentUserId } })
  const other = await prisma.user.findUnique({ where: { id: otherUserId } })

  if (!current || !other)
    return NextResponse.json({ error: "User not found" }, { status: 404 })

  await prisma.$transaction([
    prisma.user.update({
      where: { id: current.id },
      data: { shiftId: other.shiftId },
    }),
    prisma.user.update({
      where: { id: other.id },
      data: { shiftId: current.shiftId },
    }),
  ])

  return NextResponse.json({ success: true })
}

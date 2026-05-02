import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { prisma } from "./prisma"
import { cache } from "react"
import { getTodayStartJakarta } from "./time"

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

const SECRET = process.env.JWT_SECRET

export const signToken = (payload) =>
  jwt.sign(payload, SECRET, { expiresIn: "7d" })

export async function setAuthCookie(token) {
  const cookieStore = await cookies()
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("token")
}

export async function getUserFromCookie() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

export const getCurrentUser = cache(async () => {
  const decoded = await getUserFromCookie()
  if (!decoded?.id) return null

  const today = getTodayStartJakarta().toDate()

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: {
      shift: true,
      location: true,
      shiftAssignments: {
        where: {
          date: today,
        },
        include: {
          shift: true,
        },
        take: 1,
      },
    },
  })

  if (!user) return null

  const todayAssignment = user.shiftAssignments?.[0]

  return {
    ...user,
    todayShift: todayAssignment?.shift || user.shift || null,
  }
})

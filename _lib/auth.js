import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { prisma } from "./prisma"
import { cache } from "react"

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

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: { shift: true, location: true },
  })

  if (!user) return null

  // Lazy Activation Check
  if (!user.isActive && user.inactiveUntil && new Date() > user.inactiveUntil) {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        inactiveUntil: null,
      },
      include: { shift: true, location: true },
    })
    return updatedUser
  }

  return user
})

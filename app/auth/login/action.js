"use server"

import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/_lib/prisma"
import { getCurrentUser, removeAuthCookie, signToken } from "@/_lib/auth"
import { logActivity } from "@/_server/logAction"
import { LogAction } from "@prisma/client"

export async function AuthAction(prevState, formData) {
  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Both fields are required" }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: "User not found" }
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    await logActivity({
      userId: user.id,
      url: "/auth/login",
      action: LogAction.SUBMIT,
      method: LogAction.POST,
      data: { success: false, reason: "Invalid password" },
    })

    return { error: "Invalid password" }
  }

  const token = signToken({
    id: user.id,
    name: user.name,
    role: user.role,
  })

  await logActivity({
    userId: user.id,
    url: "/auth/login",
    action: LogAction.SUBMIT,
    method: LogAction.POST,
    data: {
      success: true,
      role: user.role,
    },
  })

  const cookieStore = await cookies()
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  if (user.role === "ADMIN") redirect("/admin/dashboard")
  if (user.role === "USER") redirect("/user/dashboard")
  if (user.role === "COORDINATOR") redirect("/coordinator/dashboard")
  if (user.role === "EMPLOYEE") redirect("/employee/dashboard")
}

export async function LogoutAuthAction() {
  const user = await getCurrentUser()

  if (user?.id) {
    await logActivity({
      userId: user.id,
      url: "/auth/logout",
      action: LogAction.SUBMIT,
      method: LogAction.POST,
    })
  }

  await removeAuthCookie()
  redirect("/auth/login")
}

"use server"

import bcrypt from "bcryptjs"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import { prisma } from "@/_lib/prisma"
import { signToken, getCurrentUser, removeAuthCookie } from "@/_lib/auth"
import { LogAction, LogMethod, SecurityAction } from "@prisma/client"
import { logActivity } from "@/_server/admin-action/logAction"

import { logSecurity, reportSuspicious, checkAndLockUser } from "@/_server/admin-action/securityAction"

export async function AuthAction(prevState, formData) {
  const email = formData.get("email")?.toString()
  const password = formData.get("password")?.toString()

  if (!email || !password) {
    return { error: "Email & password required" }
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    await reportSuspicious({
      ip: headers().get("x-forwarded-for") ?? "",
      reason: "Login with unknown email",
      score: 40,
    })
    return { error: "Invalid credentials" }
  }

  if (user.isLocked) {
    return {
      error: "Account locked due to suspicious activity",
    }
  }

  const ip = headers().get("x-forwarded-for") ?? ""
  const ua = headers().get("user-agent") ?? ""

  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
    await logActivity({
      userId: user.id,
      url: "/auth/login",
      action: LogAction.SUBMIT,
      method: LogMethod.POST,
      data: { success: false },
    })

    await logSecurity({
      userId: user.id,
      action: SecurityAction.LOGIN_FAILED,
      ip,
      userAgent: ua,
    })

    await reportSuspicious({
      userId: user.id,
      ip,
      reason: "Invalid password",
      score: 35,
    })

    await checkAndLockUser(user.id)

    return { error: "Invalid credentials" }
  }

  // LOGIN SUCCESS
  const token = signToken({
    id: user.id,
    name: user.name,
    role: user.role,
  })

  await logActivity({
    userId: user.id,
    url: "/auth/login",
    action: LogAction.SUBMIT,
    method: LogMethod.POST,
    data: { success: true },
  })

  await logSecurity({
    userId: user.id,
    action: SecurityAction.LOGIN_SUCCESS,
    ip,
    userAgent: ua,
  })

  // reset suspicious
  await prisma.suspiciousActivity.updateMany({
    where: { userId: user.id, resolved: false },
    data: { resolved: true },
  })

  cookies().set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  if (user.role === "ADMIN") redirect("/admin/dashboard")
  if (user.role === "USER") redirect("/user/dashboard")
  if (user.role === "COORDINATOR") redirect("/coordinator/dashboard")
  redirect("/employee/dashboard")
}

export async function LogoutAuthAction() {
  const user = await getCurrentUser()

  if (user?.id) {
    await logSecurity({
      userId: user.id,
      action: SecurityAction.LOGOUT,
    })
  }

  await removeAuthCookie()
  redirect("/auth/login")
}

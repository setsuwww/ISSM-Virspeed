"use server"

import bcrypt from "bcryptjs"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import { prisma } from "@/_lib/prisma"
import { signToken, removeAuthCookie, getUserFromCookie } from "@/_lib/auth"
import { LogAction, LogMethod, SecurityAction } from "@prisma/client"
import { logActivity } from "@/_servers/admin-services/log_action"

import { logSecurity, reportSuspicious, checkAndLockUser } from "@/_servers/admin-services/security_action"
import { validateLogin } from "@/_jobs/validator/auth_validate"
import { loginRateLimit } from "@/_lib/rate-limit"

export async function AuthAction(prevState, formData) {
  const h = await headers()
  const ipAddr = h.get("x-forwarded-for") ?? "127.0.0.1"
  const userAgent = h.get("user-agent") ?? ""

  const { success: allowed } = await loginRateLimit.limit(ipAddr)
  if (!allowed) {
    return { error: "Too many login attempts, try again later" }
  }

  const email = formData.get("email")?.toString() ?? ""
  const password = formData.get("password")?.toString() ?? ""

  const { success, error, errors, user } = await validateLogin({ email, password })

  if (!success) {
    return { errors, error }
  }

  const fakeHash = "$2a$12$KbQiN4N3z5uJgL3z3lW9weu7s7cFjFjFjFjFjFjFjFjFjFjFjFjF"
  const hashToCompare = user ? user.password : fakeHash
  const isValidPassword = await bcrypt.compare(password, hashToCompare)

  if (!user) {
    await reportSuspicious({
      ip: ipAddr,
      reason: "Login with unknown email",
      score: 40,
    })
    return { error: "Invalid credentials" }
  }

  const now = new Date()
  if (user.isLocked || (user.lockedUntil && user.lockedUntil > now)) {
    return { error: "Account locked due to suspicious activity" }
  }

  if (!isValidPassword) {
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
      ip: ipAddr,
      userAgent,
    })

    await reportSuspicious({
      userId: user.id,
      ip: ipAddr,
      reason: "Invalid password",
      score: 35,
    })

    await checkAndLockUser(user.id)

    await new Promise(r => setTimeout(r, 500))

    return { error: "Invalid credentials" }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null },
  })

  const token = signToken({ id: user.id, name: user.name, role: user.role })
  cookies().set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
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
    ip: ipAddr,
    userAgent,
  })

  await prisma.suspiciousActivity.updateMany({
    where: { userId: user.id, resolved: false },
    data: { resolved: true },
  })

  switch (user.role) {
    case "ADMIN": redirect("/admin/dashboard")
    case "SUPERVISOR": redirect("/supervisor/dashboard")
    case "EMPLOYEE": redirect("/employee/dashboard")
    case "USER": redirect("/user/dashboard")
    default: redirect("/employee/dashboard")
  }
}

export async function LogoutAuthAction() {
  const decoded = await getUserFromCookie()

  if (decoded?.id) {
    await logSecurity({
      userId: decoded.id,
      action: SecurityAction.LOGOUT,
    })
  }

  await removeAuthCookie()
  redirect("/auth/login")
}

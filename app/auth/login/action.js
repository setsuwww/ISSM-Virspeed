"use server"

import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "@/_lib/prisma"
import { signToken, removeAuthCookie } from "@/_lib/auth"

export async function AuthAction(prevState, formData) {
  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) { return { error: "Both fields are required" } }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) { return { error: "User not found" } }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) { return { error: "Invalid password" } }

  const token = signToken({
    id: user.id, name: user.name, role: user.role,
  })

  cookies().set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  if (user.role === "ADMIN") redirect("/admin/dashboard")
  if (user.role === "USER") redirect("/user/dashboard")
  if (user.role === "COORDINATOR") redirect("/coordinator/dashboard")
  if (user.role === "EMPLOYEE") redirect("/employee/dashboard")

  return { success: true }
}

export async function LogoutAuthAction() {
  await removeAuthCookie()
  redirect("/auth/login")
}

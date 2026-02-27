"use server"

import { prisma } from "@/_lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateProfile(data) {
  const { id, name, email, divisionId, shiftId } = data

  try {
    const updated = await prisma.user.update({
      where: { id: id },
      data: { name, email, divisionId, shiftId },
      include: { shift: true, division: true },
    })
    revalidatePath("/admin/profiles")
    return { success: true, user: updated }
  } catch (err) {
    console.error("updateProfile error:", err)
    return { success: false, message: "Gagal memperbarui profil" }
  }
}

export async function updateShiftTime(data) {
  const { id, startTime, endTime } = data

  try {
    const updated = await prisma.shift.update({
      where: { id: id },
      data: { startTime, endTime },
    })
    revalidatePath("/admin/profiles")
    return { success: true, shift: updated }
  } catch (err) {
    console.error("updateShiftTime error:", err)
    return { success: false, message: "Gagal memperbarui shift" }
  }
}

export async function updateChangePassword(data) {
  const { id, currentPassword, newPassword, confirmPassword } = data

  try {
    if (!id || !currentPassword || !newPassword || !confirmPassword) {
      return { success: false, message: "Semua field wajib diisi." }
    }

    if (newPassword !== confirmPassword) {
      return { success: false, message: "Konfirmasi password tidak cocok." }
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, password: true },
    })

    if (!user) {
      return { success: false, message: "User tidak ditemukan." }
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isMatch) {
      return { success: false, message: "Password saat ini salah." }
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password)

    if (isSamePassword) {
      return { success: false, message: "Password baru tidak boleh sama dengan password lama." }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })

    revalidatePath("/admin/profiles")

    return { success: true, message: "Password berhasil diperbarui." }

  } catch (error) {
    console.error("updateChangePassword error:", error)
    return { success: false, message: "Gagal mengubah password." }
  }
}

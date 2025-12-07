"use server"

import { prisma } from "@/_lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateProfile(data) {
  const { id, name, email, divisionId, shiftId } = data

  try {
    const updated = await prisma.user.update({
      where: { id: Number(id) },
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
      where: { id: Number(id) },
      data: { startTime, endTime },
    })
    revalidatePath("/admin/profiles")
    return { success: true, shift: updated }
  } catch (err) {
    console.error("updateShiftTime error:", err)
    return { success: false, message: "Gagal memperbarui shift" }
  }
}

"use server"

import { prisma } from "@/_lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto";
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

"use server";

import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { transporter } from "@/lib/mailer";

export async function forgotPasswordAction(formData) {
  const email = formData.get("email");

  if (!email) return;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Selalu tampilkan success di frontend
  if (!user) {
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${rawToken}`;

  await transporter.sendMail({
    from: `"Your App" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: "Reset Your Password",
    html: `
      <p>Hello ${user.name},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 30 minutes.</p>
    `,
  });
}

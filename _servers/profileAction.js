"use server"

import { prisma } from "@/_lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto";
import { revalidatePath } from "next/cache"

export async function updateProfile(data) {
  const { id, name, email, locationId, shiftId } = data

  try {
    const updated = await prisma.user.update({
      where: { id: id },
      data: { name, email, locationId, shiftId },
      include: { shift: true, location: true },
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

export async function sendResetEmail(user) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 jam

  // simpan token
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  // kirim email
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: '"Support" <support@example.com>',
    to: user.email,
    subject: "Reset Password",
    html: `Click <a href="${resetLink}">here</a> to reset your password. Link valid 1 hour.`,
  });
}

export async function forgotPasswordAction(formData) {
  const { email } = Object.fromEntries(formData.entries());
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) await sendResetEmail(user);

  return { success: true, message: "If the email is registered, a reset link has been sent." };
}

export async function resendPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, expiresAt: { gt: new Date() } },
    });
    await sendResetEmail(user);
  }

  return { success: true, message: "If the email is registered, a reset link has been sent." };
}

export async function resetPassword(token, newPassword) {
  const resetEntry = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetEntry || resetEntry.expiresAt < new Date()) {
    return { success: false, message: "Invalid or expired token" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: resetEntry.userId },
    data: { password: hashedPassword, tokenVersion: { increment: 1 } },
  });

  // hapus token setelah dipakai
  await prisma.passwordResetToken.delete({ where: { id: resetEntry.id } });

  return { success: true, message: "Password updated" };
}

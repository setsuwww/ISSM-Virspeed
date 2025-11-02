"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/_lib/prisma"

export async function createDivision(data) {
  try {
    const newDivision = await prisma.division.create({
      data: {
        name: data.name,
        location: data.location,
        longitude: data.longitude,
        latitude: data.latitude,
        radius: data.radius,
        type: data.type,
        status: data.status,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    })
    revalidatePath("/admin/dashboard/users/divisions")
    return { success: true, division: newDivision }
  } catch (error) {
    console.error("❌ Error creating division:", error)
    return { success: false, message: "Failed to create division" }
  }
}

export async function updateDivisionStatus(id, newStatus) {
  try {
    await prisma.division.update({
      where: { id },
      data: { status: newStatus },
    })
    revalidatePath("/admin/dashboard/users/divisions")
    return { success: true }
  } catch (error) {
    console.error("❌ Error updating status:", error)
    return { success: false }
  }
}

export async function bulkDeleteDivisions(ids) {
  try {
    await prisma.division.deleteMany({
      where: { id: { in: ids } },
    })
    revalidatePath("/admin/dashboard/users/divisions")
    return { success: true }
  } catch (error) {
    console.error("❌ Error bulk deleting:", error)
    return { success: false }
  }
}

export async function bulkToggleDivisions({ activateType, deactivateType, isActive }) {
  try {
    if (isActive) {
      await prisma.division.updateMany({
        where: { type: activateType },
        data: { status: "ACTIVE" },
      })
      await prisma.division.updateMany({
        where: { type: deactivateType },
        data: { status: "INACTIVE" },
      })
    } else {
      await prisma.division.updateMany({
        where: { type: activateType },
        data: { status: "INACTIVE" },
      })
      await prisma.division.updateMany({
        where: { type: deactivateType },
        data: { status: "ACTIVE" },
      })
    }

    revalidatePath("/admin/dashboard/users/divisions")
    return { success: true }
  } catch (error) {
    console.error("❌ Bulk update failed:", error)
    return { success: false, message: "Bulk update failed" }
  }
}

export async function updateDivision(id, data) {
  try {
    const {
      name, location, longitude, latitude, radius,
      type, status, startTime, endTime,
    } = data

    if (!name || !location) {
      return { success: false, message: "Name and location are required" }
    }

    const updatedDivision = await prisma.division.update({
      where: { id: Number(id) },
      data: {
        name,
        location,
        longitude: longitude ?? null,
        latitude: latitude ?? null,
        radius: radius ?? null,
        type,
        status,
        startTime: startTime ?? null,
        endTime: endTime ?? null,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/admin/dashboard/users/divisions")

    return { success: true, data: updatedDivision }
  } catch (error) {
    console.error("❌ Division update error:", error)
    return { success: false, message: error.message || "Failed to update division" }
  }
}

export async function deleteDivision(id) {
  await prisma.division.delete({ where: { id } })
  revalidatePath("/admin/divisions")
}

export async function deleteAllDivisions() {
  await prisma.division.deleteMany()
  revalidatePath("/admin/divisions")
}

export async function toggleDivisionStatus(id) {
  const division = await prisma.division.findUnique({ where: { id } })
  if (!division) throw new Error("Division not found")

  const newStatus = division.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
  await prisma.division.update({
    where: { id },
    data: { status: newStatus },
  })

  revalidatePath("/admin/divisions")
}
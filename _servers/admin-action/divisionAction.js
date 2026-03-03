"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/_lib/prisma"
import { timeToMinutes, minutesToTime } from "@/_functions/globalFunction"

export async function getDivisions({ page = 1, limit = 10, search = "", typeFilter = "all", statusFilter = "all" } = {}) {
  const skip = (page - 1) * limit;

  const where = {
    ...(search && { name: { contains: search, mode: "insensitive" } }),
    ...(typeFilter !== "all" && { type: typeFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  };

  const [divisions, total] = await Promise.all([
    prisma.division.findMany({
      where, skip, take: limit, orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true,
        location: true, type: true, status: true,
        startTime: true, endTime: true,
        createdAt: true, updatedAt: true,
      },
    }),
    prisma.division.count({ where }),
  ]);

  const formattedDivisions = divisions.map((division) => ({
    ...division,
    startTime: minutesToTime(division.startTime),
    endTime: minutesToTime(division.endTime),
  }));

  return { data: formattedDivisions, total };
}

export async function createDivision(data) {
  try {
    const newDivision = await prisma.division.create({
      data: {
        name: data.name,
        location: data.location, longitude: data.longitude, latitude: data.latitude, radius: data.radius,
        type: data.type, status: data.status,
        startTime: data.startTime, endTime: data.endTime,
      },
    })
    revalidatePath("/admin/dashboard/users/divisions")
    return { success: true, division: newDivision }
  }
  catch (error) { return { success: false, message: "Failed to create division" }}
}

export async function updateDivisionStatus(id, newStatus) {
  try {
    await prisma.division.update({
      where: { id }, data: { status: newStatus },
    })
    revalidatePath("/admin/dashboard/users/divisions")
    return { success: true }
  }
  catch (error) { return { success: false }}
}

export async function bulkToggleSelectedDivision({ ids, isActive }) {
  try {
    await prisma.division.updateMany({
      where: { id: { in: ids }},
      data: { status: isActive ? "ACTIVE" : "INACTIVE" }
    });

    revalidatePath("/admin/dashboard/users/divisions");
    return { success: true };
  }
  catch (error) { return { success: false }}
}

export async function bulkToggle({ activateType, deactivateType, isActive }) {
  try {
    if (isActive) {
      await prisma.division.updateMany({
        where: { type: activateType },
        data: { status: "ACTIVE" },
      });

      await prisma.division.updateMany({
        where: { type: deactivateType },
        data: { status: "INACTIVE" },
      });

    } else {
      await prisma.division.updateMany({
        where: { type: activateType },
        data: { status: "INACTIVE" },
      });

      await prisma.division.updateMany({
        where: { type: deactivateType },
        data: { status: "ACTIVE" },
      });
    }

    revalidatePath("/admin/dashboard/users/divisions");
    return { success: true, message: "Global toggle updated."};

  }
  catch (error) { return { success: false, error: error.message || "Unknown error"}}
}

export async function toggleDivisionType(id) {
  try {
    const division = await prisma.division.findUnique({
      where: { id },
      select: { type: true },
    });

    if (!division) {
      return { success: false, message: "Division not found" };
    }

    const nextType = division.type === "WFA" ? "WFO" : "WFA";

    await prisma.division.update({
      where: { id },
      data: { type: nextType },
    });

    revalidatePath("/admin/dashboard/users/divisions");

    return {
      success: true,
      message: `Division switched to ${nextType}`,
      nextType,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to switch division type",
    };
  }
}

export async function toggleDivisionStatus(id) {
  const division = await prisma.division.findUnique({ where: { id } })
  if (!division) throw new Error("Division not found")

  const newStatus = division.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
  await prisma.division.update({
    where: { id },
    data: { status: newStatus },
  })

  revalidatePath("/admin/dashboard/users/divisions")
}

export async function updateDivision(id, data) {
  try {
    const {
      name, location, longitude, latitude, radius,
      type, status, startTime, endTime,
    } = data

    if (!name || !location) return { success: false, message: "Name and location are required" }

    const updatedDivision = await prisma.division.update({
      where: { id: Number(id) },
      data: {
        name, location,
        longitude: longitude ? parseFloat(longitude) : null, latitude: latitude ? parseFloat(latitude) : null,
        radius: radius ? parseFloat(radius) : null,
        type, status,
        startTime: timeToMinutes(startTime) ?? null, endTime: timeToMinutes(endTime) ?? null,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/admin/dashboard/users/divisions")

    return { success: true, data: updatedDivision }
  }
  catch (error) { return { success: false, message: error.message || "Failed to update division" }}
}

export async function deleteDivisionById(id) {
  await prisma.division.delete({ where: { id } })
  revalidatePath("/admin/dashboard/users/divisions")
}

export async function deleteDivisions() {
  await prisma.division.deleteMany()
  revalidatePath("/admin/dashboard/users/divisions")
}

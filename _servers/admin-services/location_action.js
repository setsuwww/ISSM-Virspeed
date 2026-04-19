"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/_lib/prisma"
import { timeToMinutes, minutesToTime } from "@/_functions/globalFunction"
import { validateCreateLocation, validateUpdateLocation } from "@/_jobs/validator/location_validate"

export async function getLocations({ page = 1, limit = 10, search = "", typeFilter = "all", statusFilter = "all" } = {}) {
  const skip = (page - 1) * limit;

  const where = {
    ...(search && { name: { contains: search, mode: "insensitive" } }),
    ...(typeFilter !== "all" && { type: typeFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  };

  const [locations, total] = await Promise.all([
    prisma.location.findMany({
      where, skip, take: limit, orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true,
        location: true, type: true, status: true,
        startTime: true, endTime: true,
        createdAt: true, updatedAt: true,
      },
    }),
    prisma.location.count({ where }),
  ]);

  const formattedLocations = locations.map((location) => ({
    ...location,
    startTime: minutesToTime(location.startTime),
    endTime: minutesToTime(location.endTime),
  }));

  return { data: formattedLocations, total };
}

export async function createLocation(data) {
  try {
    const parsedData = { 
        ...data,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        radius: data.radius ? parseFloat(data.radius) : null,
        startTime: typeof data.startTime === 'string' ? timeToMinutes(data.startTime) : data.startTime,
        endTime: typeof data.endTime === 'string' ? timeToMinutes(data.endTime) : data.endTime,
    };
    
    const result = await validateCreateLocation(parsedData);
    if (!result.success) {
      return { success: false, message: Object.values(result.errors).flat().join(", ") };
    }

    const newLocation = await prisma.location.create({
      data: result.data,
    })
    revalidatePath("/admin/dashboard/users/locations")
    return { success: true, location: newLocation }
  }
  catch (error) { return { success: false, message: error.message || "Failed to create location" } }
}

export async function updateLocationStatus(id, newStatus) {
  try {
    await prisma.location.update({
      where: { id }, data: { status: newStatus },
    })
    revalidatePath("/admin/dashboard/users/locations")
    return { success: true }
  }
  catch (error) { return { success: false } }
}

export async function bulkToggleSelectedLocation({ ids, isActive }) {
  try {
    await prisma.location.updateMany({
      where: { id: { in: ids } },
      data: { status: isActive ? "ACTIVE" : "INACTIVE" }
    });

    revalidatePath("/admin/dashboard/users/locations");
    return { success: true };
  }
  catch (error) { return { success: false } }
}

export async function bulkToggle({ activateType, deactivateType, isActive }) {
  try {
    if (isActive) {
      await prisma.location.updateMany({
        where: { type: activateType },
        data: { status: "ACTIVE" },
      });

      await prisma.location.updateMany({
        where: { type: deactivateType },
        data: { status: "INACTIVE" },
      });

    } else {
      await prisma.location.updateMany({
        where: { type: activateType },
        data: { status: "INACTIVE" },
      });

      await prisma.location.updateMany({
        where: { type: deactivateType },
        data: { status: "ACTIVE" },
      });
    }

    revalidatePath("/admin/dashboard/users/locations");
    return { success: true, message: "Global toggle updated." };

  }
  catch (error) { return { success: false, error: error.message || "Unknown error" } }
}

export async function toggleLocationType(id) {
  try {
    const location = await prisma.location.findUnique({
      where: { id },
      select: { type: true },
    });

    if (!location) {
      return { success: false, message: "Location not found" };
    }

    const nextType = location.type === "WFA" ? "WFO" : "WFA";

    await prisma.location.update({
      where: { id },
      data: { type: nextType },
    });

    revalidatePath("/admin/dashboard/users/locations");

    return {
      success: true,
      message: `Location switched to ${nextType}`,
      nextType,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to switch location type",
    };
  }
}

export async function toggleLocationStatus(id) {
  const location = await prisma.location.findUnique({ where: { id } })
  if (!location) throw new Error("Location not found")

  const newStatus = location.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
  await prisma.location.update({
    where: { id },
    data: { status: newStatus },
  })

  revalidatePath("/admin/dashboard/users/locations")
}

export async function updateLocation(id, data) {
  try {
    const parsedData = { 
      ...data, 
      id: Number(id),
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      radius: data.radius ? parseFloat(data.radius) : null,
      startTime: typeof data.startTime === 'string' ? timeToMinutes(data.startTime) : data.startTime,
      endTime: typeof data.endTime === 'string' ? timeToMinutes(data.endTime) : data.endTime,
    };

    const result = await validateUpdateLocation(parsedData);
    if (!result.success) {
      return { success: false, message: Object.values(result.errors).flat().join(", ") }
    }

    const updatePayload = { ...result.data };
    delete updatePayload.id;

    const updatedLocation = await prisma.location.update({
      where: { id: Number(id) },
      data: { ...updatePayload, updatedAt: new Date() },
    })

    revalidatePath("/admin/dashboard/users/locations")
    return { success: true, data: updatedLocation }
  }
  catch (error) { return { success: false, message: error.message || "Failed to update location" } }
}

export async function deleteLocationById(id) {
  await prisma.location.delete({ where: { id } })
  revalidatePath("/admin/dashboard/users/locations")
}

export async function deleteLocations() {
  await prisma.location.deleteMany()
  revalidatePath("/admin/dashboard/users/locations")
}

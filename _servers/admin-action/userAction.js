"use server"

import { prisma } from "@/_lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function getUsers(page, limit) {
  return prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true,
      createdAt: true, updatedAt: true,
      shift: {
        select: { name: true, type: true, startTime: true, endTime: true },
      },
      location: {
        select: {
          name: true, startTime: true, endTime: true,
          shifts: {
            select: { name: true, startTime: true, endTime: true },
            where: { isActive: true },
          },
        }
      },
    },
  });
}

export async function getUserCount() {
  return prisma.user.count();
}

export async function createUser(formData) {
  try {
    const formObject = Object.fromEntries(formData.entries())
    let { name, email, password, role, locationId, shiftId, workMode } = formObject

    role = role || "USER"
    locationId = locationId !== "NONE" ? parseInt(locationId) : null
    shiftId = workMode === "SHIFT" && shiftId !== "NONE" ? parseInt(shiftId) : null

    if (!name || !email) { throw new Error("Name, and email, are required.") }
    password = password && password.trim() !== "" ? password : "secretPW1234"

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) { throw new Error("User with this email already exists.") }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        name, email,
        password: hashedPassword,
        role,
        locationId, shiftId,
      },
    })

    revalidatePath("/admin/dashboard/users")
    return { success: true, message: "User created successfully" }
  }
  catch (error) {
    console.error("Error creating user:", error)
    return { success: false, message: error.message || "Failed to create user" }
  }
}

export async function bulkCreateUser(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { success: false, message: "Empty data" }
  }

  let created = 0

  for (const row of rows) {
    const { name, email, password, role = "EMPLOYEE", location, workMode = "WORK_HOURS", shift } = row
    const mode = workMode?.toUpperCase() === "SHIFT" ? "SHIFT" : "WORK_HOURS"

    if (!name || !email || !location) {
      console.log("Skipping row (missing data):", row)
      continue
    }

    const locationData = await prisma.location.findFirst({
      where: { name: location?.trim() },
      include: { shifts: true },
    })

    if (!locationData) {
      console.log("Skipping row (location not found):", location)
      continue
    }

    let shiftId = null
    if (mode === "SHIFT" && shift) {
      const shiftData = locationData.shifts.find(s => s.name.trim() === shift.trim())
      if (shiftData) shiftId = shiftData.id
      else console.log("Shift not found in location:", shift)
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      console.log("Skipping row (email exists):", email)
      continue
    }

    const rawPassword = password && password.trim() !== "" ? password : "secretPW1234"
    const hashed = await bcrypt.hash(rawPassword, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
        locationId: locationData.id,
        shiftId,
      },
    })

    created++
  }

  console.log("Total inserted:", created)
  return { success: true, count: created }
}

export async function updateUser(data) {
  try {
    const { id, name, email, password, role, shiftId, locationId } = data;

    if (!id) { return { error: "User ID is required." } }

    const updateData = {
      name, email, role,
      locationId: locationId ? parseInt(locationId) : null, shiftId: shiftId ? parseInt(shiftId) : null,
    };

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateData.password = hashedPassword;
    }

    await prisma.user.update({
      where: { id: id },
      data: updateData,
    });

    return { success: true };
  }
  catch (error) {
    return { error: "Failed to update user." };
  }
}

export async function deleteUserById(id) {
  await prisma.user.delete({ where: { id: id } });
  return { success: true };
}

export async function deleteUsers(ids) {
  try {
    if (!ids || !Array.isArray(ids)) throw new Error("Invalid request")

    await prisma.user.deleteMany({ where: { id: { in: ids } } })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    throw new Error("Failed to delete users.")
  }
}

// ------------------------
// SHIFT : EMPLOYEES
// ------------------------

export async function getShiftEmployees({ page = 1, limit = 10 }) {
  return prisma.user.findMany({
    where: { role: "EMPLOYEE", shiftId: { not: null } },
    skip: (page - 1) * limit, take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true,
      createdAt: true, updatedAt: true,
      shift: {
        select: {
          id: true, name: true, type: true,
          startTime: true, endTime: true,
        },
      },
      location: { select: { id: true, name: true, type: true } },
    },
  });
}

export async function getShiftEmployeeCount() {
  return prisma.user.count({
    where: { role: "EMPLOYEE", shiftId: { not: null } },
  });
}

export async function getSEFilterData() {
  const [locations, shifts] = await Promise.all([
    prisma.location.findMany({
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    }),
    prisma.shift.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { locations, shifts };
}

// ------------------------
// NORMAL : EMPLOYEES
// ------------------------

export async function getNormalEmployees({ page = 1, limit = 10 }) {
  return prisma.user.findMany({
    where: {
      role: "EMPLOYEE", shiftId: null, locationId: { not: null },
      location: { startTime: { not: null }, endTime: { not: null } },
    },
    skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true,
      createdAt: true, updatedAt: true,
      location: { select: { id: true, name: true, type: true, startTime: true, endTime: true } },
    },
  });
}

export async function getNormalEmployeeCount() {
  return prisma.user.count({
    where: {
      role: "EMPLOYEE", shiftId: null, locationId: { not: null },
      location: {
        startTime: { not: null },
        endTime: { not: null },
      },
    },
  });
}

export async function getSELocations() {
  return prisma.location.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, type: true },
    orderBy: {
      name: "asc",
    },
  });
}


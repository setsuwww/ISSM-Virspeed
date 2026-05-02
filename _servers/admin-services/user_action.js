"use server"

import { prisma } from "@/_lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { validateCreateUser, validateUpdateUser } from "@/_jobs/validator/user_validate"

function normalizeEmail(email) {
  return email.toLowerCase().trim()
}

function generateDefaultPassword(name) {
  const normalized = name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")

  if (!normalized) {
    throw new Error("Invalid name for password generation")
  }

  return `${normalized}@next.com`
}

// ------------------------
// MANAGE
// ------------------------

export async function getUsers(page, limit, where = {}) {
  return prisma.user.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      shift: {
        select: {
          name: true,
          type: true,
          startTime: true,
          endTime: true,
        },
      },
      location: {
        select: {
          name: true,
          startTime: true,
          endTime: true,
          shifts: {
            where: { isActive: true },
            select: {
              name: true,
              startTime: true,
              endTime: true,
              type: true,
            },
          },
        },
      },
    },
  })
}

export async function getUserCount(where = {}) {
  return prisma.user.count({
    where,
  })
}

export async function bulkCreateUser(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { success: false, message: "Empty data" }
  }

  try {
    const locations = await prisma.location.findMany({
      include: { shifts: true },
    })

    const locationMap = new Map(
      locations.map((l) => [l.name.trim().toLowerCase(), l])
    )

    const existingUsers = await prisma.user.findMany({
      select: { email: true },
    })

    const existingEmailSet = new Set(
      existingUsers.map((u) => u.email.toLowerCase())
    )

    const dataToInsert = []

    for (const row of rows) {
      let {
        name, email, password,
        role = "EMPLOYEE", location, workMode = "WORK_HOURS",
        shift,
      } = row

      if (!name || !email || !location) continue

      email = normalizeEmail(email)

      if (existingEmailSet.has(email)) continue

      const locationData = locationMap.get(location.trim().toLowerCase())
      if (!locationData) continue

      const mode = workMode.toUpperCase() === "SHIFT" ? "SHIFT" : "WORK_HOURS"

      let shiftId = null

      if (mode === "SHIFT" && shift) {
        const shiftData = locationData.shifts.find(
          (s) => s.name.trim().toLowerCase() === shift.trim().toLowerCase()
        )
        if (shiftData) shiftId = shiftData.id
      }

      let rawPassword =
        password && password.trim() !== ""
          ? password
          : generateDefaultPassword(name)

      const hashed = await bcrypt.hash(rawPassword, 10)

      dataToInsert.push({
        name,
        email,
        password: hashed,
        role,
        locationId: locationData.id,
        shiftId,
      })

      existingEmailSet.add(email)
    }

    if (dataToInsert.length === 0) {
      return { success: false, message: "No valid data to insert" }
    }

    await prisma.$transaction([
      prisma.user.createMany({
        data: dataToInsert,
      }),
    ])

    return {
      success: true,
      count: dataToInsert.length,
    }
  } catch (error) {
    console.error("bulkCreateUser error:", error)
    return { success: false, message: "Bulk insert failed" }
  }
}

export async function createUser(formData) {
  try {
    const formObject = Object.fromEntries(formData.entries())

    const result = await validateCreateUser(formObject)
    if (!result.success) {
      return { success: false, message: Object.values(result.errors).flat().join(", ") }
    }

    let { name, email, password, role, locationId, shiftId, workMode } = result.data

    email = normalizeEmail(email)

    role = role || "USER"
    locationId = locationId !== "NONE" ? parseInt(locationId) : null
    shiftId = workMode === "SHIFT" && shiftId !== "NONE" ? parseInt(shiftId) : null

    if (!password || password.trim() === "") {
      password = generateDefaultPassword(name)
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        locationId,
        shiftId,
      },
    })

    revalidatePath("/admin/dashboard/users")

    return { success: true }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

export async function updateUser(data) {
  try {
    const result = await validateUpdateUser(data)

    if (!result.success) {
      return { success: false, message: Object.values(result.errors).flat().join(", ") }
    }

    const { id, name, email, password, role, shiftId, locationId } = result.data

    const updateData = {}

    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email.toLowerCase()
    if (role !== undefined) updateData.role = role

    if (locationId !== undefined) {
      updateData.locationId = locationId ? parseInt(locationId) : null
    }

    if (shiftId !== undefined) {
      updateData.shiftId = shiftId ? parseInt(shiftId) : null
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    })

    return { success: true }
  } catch (err) {
    return { success: false, message: "Update failed" }
  }
}

export async function deleteUserById(id) {
  await prisma.user.delete({ where: { id } })
  return { success: true }
}

export async function deleteUsers(ids) {
  if (!Array.isArray(ids)) {
    throw new Error("Invalid request")
  }

  await prisma.user.deleteMany({
    where: { id: { in: ids } },
  })

  revalidatePath("/admin/users")

  return { success: true }
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
      id: true, name: true, email: true, role: true, isActive: true,
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

export async function getShiftEmployeeLocations() {
  return prisma.location.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, type: true },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getShiftEmployeeFilterData() {
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
      id: true, name: true, email: true, role: true, isActive: true,
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

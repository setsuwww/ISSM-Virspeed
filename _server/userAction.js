"use server"

import { prisma } from "@/_lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function createUser(formData) {
  try {
    const name = formData.get("name")
    const email = formData.get("email")
    const password = formData.get("password")
    const role = formData.get("role") || "USER"
    const divisionId = formData.get("divisionId") !== "NONE" ? parseInt(formData.get("divisionId")) : null
    const workMode = formData.get("workMode")
    const shiftId =
      workMode === "SHIFT" && formData.get("shiftId") !== "NONE"
        ? parseInt(formData.get("shiftId"))
        : null

    if (!name || !email || !password) { throw new Error("Name, email, and password are required.")}

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) { throw new Error("User with this email already exists.")}

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        name, email,
        password: hashedPassword,
        role,
        divisionId, shiftId,
      },
    })

    revalidatePath("/admin/dashboard/users")
    return { success: true, message: "User created successfully" }
  } 
  catch (error) { console.error("Error creating user:", error)
    return { success: false, message: error.message || "Failed to create user" }
  }
}

export async function updateUser(data) {
  try { const { id, name, email, password, role, shiftId, divisionId } = data;

    if (!id) { return { error: "User ID is required." }}

    const updateData = {
      name, email, role,
      divisionId: divisionId ? parseInt(divisionId) : null, shiftId: shiftId ? parseInt(shiftId) : null,
    };

    if (password && password.trim() !== "") { const hashedPassword = await bcrypt.hash(password, 12);
      updateData.password = hashedPassword;
    }

    await prisma.user.update({ where: { id: parseInt(id) },
      data: updateData,
    });

    return { success: true };
  } 
  catch (error) { console.error(error);
    return { error: "Failed to update user." };
  }
}

export async function deleteUsers(ids) {
  try { if (!ids || !Array.isArray(ids)) throw new Error("Invalid request")

    await prisma.user.deleteMany({ where: { id: { in: ids } }})

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) { console.error(error)
    throw new Error("Failed to delete users.")
  }
}

export async function getUserWithId(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) }, select: { id: true, name: true, email: true, role: true },
  });
}

export async function updateUserWithId(id, data) {
  const { name, email, password, role, shiftId } = data;
  if (!name || !email || !role) throw new Error("Name, email, and role required");

  const dataToUpdate = { name, email, role, shiftId: shiftId ?? null };
  if (password?.trim()) { dataToUpdate.password = await bcrypt.hash(password, 10)}

  return prisma.user.update({
    where: { id: Number(id) },
    data: dataToUpdate,
  });
}

export async function deleteUserWithId(id) {
  await prisma.user.delete({ where: { id: Number(id) } });
  return { success: true };
}
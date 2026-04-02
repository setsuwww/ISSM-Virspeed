import { NextResponse } from "next/server";
import { prisma } from "@/_lib/prisma";
import { timeToMinutes } from "@/_functions/globalFunction";

export async function GET(req, context) {
  const params = await context.params;

  try {
    const shift = await prisma.shift.findUnique({
      where: { id: parseInt(params.id) },
      include: { users: true, schedules: true },
    });

    if (!shift) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(shift);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch shift" }, { status: 500 });
  }
}

export async function PUT(req, context) {
  const params = await context.params;

  try {
    const body = await req.json();
    const { type, name, startTime, endTime, locationId } = body;

    const updated = await prisma.shift.update({
      where: { id: parseInt(params.id) },
      data: {
        type,
        name,
        startTime: timeToMinutes(startTime),
        endTime: timeToMinutes(endTime),
        locationId: parseInt(locationId),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating shift:", error);
    return NextResponse.json({ error: "Failed to update shift" }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  const params = await context.params;

  try {
    await prisma.shift.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete shift" }, { status: 500 });
  }
}

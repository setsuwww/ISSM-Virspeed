import { NextResponse } from "next/server";
import { prisma } from "@/_lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, name, startTime, endTime } = body;

    if (!name || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Shift name, start time, and end time are required" },
        { status: 400 }
      );
    }

    const newShift = await prisma.shift.create({
      data: {
        type, name,
        startTime, endTime,
        locationId: body.locationId
      },
    });

    return NextResponse.json(newShift, { status: 201 });
  }
  catch (error) {
    console.error("Error creating shift:", error);
    return NextResponse.json(
      { error: "Failed to create shift" },
      { status: 500 }
    );
  }
}

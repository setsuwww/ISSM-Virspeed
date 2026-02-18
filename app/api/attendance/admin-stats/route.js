import { prisma } from "@/_lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const shifts = ["MORNING", "AFTERNOON", "EVENING"];

  const result = {};

  for (const shiftType of shifts) {
    const data = await prisma.attendance.groupBy({
      by: ["status"],
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        shift: {
          type: shiftType,
        },
      },
      _count: {
        status: true,
      },
    });

    result[shiftType] = data.reduce((acc, cur) => {
      acc[cur.status] = cur._count.status;
      return acc;
    }, {});
  }

  return NextResponse.json(result);
}

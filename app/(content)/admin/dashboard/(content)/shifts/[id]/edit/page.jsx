import EditForm from "./EditForm";
import { prisma } from "@/_lib/prisma";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function EditShiftPage({ params }) {
  const shiftId = parseInt(params.id);

  const [shift, locations] = await Promise.all([
    prisma.shift.findUnique({
      where: { id: shiftId },
      select: {
        id: true, name: true, type: true,
        startTime: true, endTime: true,
        locationId: true,
      },
    }),
    prisma.location.findMany({
      orderBy: { name: "asc" }, select: { id: true, name: true },
    }),
  ]);

  if (!shift) return notFound();

  return <EditForm shift={shift} locations={locations} />;
}

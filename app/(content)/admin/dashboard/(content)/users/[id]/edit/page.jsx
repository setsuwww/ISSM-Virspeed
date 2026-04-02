import { prisma } from "@/_lib/prisma";
import EditForm from "./EditForm";

export default async function Page({ params }) {
  const [user, shifts, locations] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true, name: true, email: true, role: true,
        locationId: true, shiftId: true,
      },
    }),
    prisma.shift.findMany({
      select: { id: true, name: true },
    }),
    prisma.location.findMany({
      select: {
        id: true, name: true,
        shifts: {
          select: {
            id: true, name: true,
          },
        },
      },
    }),
  ]);

  const safeUser = JSON.parse(JSON.stringify(user));
  const safeShifts = JSON.parse(JSON.stringify(shifts));
  const safeLocations = JSON.parse(JSON.stringify(locations));

  return <EditForm user={safeUser} shifts={safeShifts} locations={safeLocations} />;
}

import { prisma } from "@/_lib/prisma";
import EditForm from "./EditForm";

export default async function Page({ params }) {
  const [user, shifts, divisions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true, name: true, email: true, role: true,
        divisionId: true, shiftId: true,
      },
    }),
    prisma.shift.findMany({
      select: { id: true, name: true },
    }),
    prisma.division.findMany({
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
  const safeDivisions = JSON.parse(JSON.stringify(divisions));

  return <EditForm user={safeUser} shifts={safeShifts} divisions={safeDivisions} />;
}

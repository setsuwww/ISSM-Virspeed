import { prisma } from "@/_lib/prisma";
import CreateForm from "./CreateForm";

export default async function Page() {
  const [shifts, locations] = await Promise.all([
    prisma.shift.findMany({
      select: { id: true, type: true, startTime: true, endTime: true },
    }),
    prisma.location.findMany({
      select: {
        id: true, name: true, startTime: true, endTime: true,
        shifts: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
          }
        }
      },
    }),
  ]);

  return <CreateForm shifts={shifts} locations={locations} />;
}

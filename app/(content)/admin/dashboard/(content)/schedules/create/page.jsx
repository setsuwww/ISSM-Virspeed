import { prisma } from "@/_lib/prisma";
import { getCurrentUser } from "@/_lib/auth";
import CreateForm from "./CreateForm";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) return <div>Unauthorized</div>;

  const schedules = await prisma.schedule.findMany({
    where: { users: { some: { userId: user.id }}},
    include: { users: { include: { user: true } }},
    orderBy: { startDate: "asc" },
  });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });

  return <CreateForm users={users} schedules={schedules} />
}

import CreateForm from "./CreateForm";
import { prisma } from "@/_lib/prisma";

export const revalidate = 60;

export default async function CreateShiftPage() {
  const divisions = await prisma.division.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true},
  });

  return <CreateForm divisions={divisions} />;
}

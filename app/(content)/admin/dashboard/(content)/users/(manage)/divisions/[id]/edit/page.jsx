import { notFound } from "next/navigation";
import { prisma } from "@/_lib/prisma";
import { DashboardHeader } from "@/app/(content)/admin/dashboard/DashboardHeader";
import EditLocationForm from "./EditForm";

export const revalidate = 60;

async function getLocation(id) {
  const division = await prisma.division.findUnique({
    where: { id },
    select: {
      id: true, name: true,
      location: true, longitude: true, latitude: true, radius: true,
      type: true, status: true,
      startTime: true, endTime: true,
      createdAt: true, updatedAt: true,
    },
  });

  if (!division) return null;
  return division;
}

export default async function Page({ params }) {
  const { id } = params;
  const division = await getLocation(Number(id));

  if (!division) return notFound();

  return (
    <section>
      <DashboardHeader
        title={`Edit Location`}
        subtitle="Update division details and configuration"
      />
      <EditLocationForm division={division} />
    </section>
  );
}

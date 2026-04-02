import { notFound } from "next/navigation";
import { prisma } from "@/_lib/prisma";
import { DashboardHeader } from "@/app/(content)/admin/dashboard/DashboardHeader";
import EditLocationForm from "./EditForm";

export const revalidate = 60;

async function getLocation(id) {
  const location = await prisma.location.findUnique({
    where: { id },
    select: {
      id: true, name: true,
      location: true, longitude: true, latitude: true, radius: true,
      type: true, status: true,
      startTime: true, endTime: true,
      createdAt: true, updatedAt: true,
    },
  });

  if (!location) return null;
  return location;
}

export default async function Page({ params }) {
  const { id } = params;
  const location = await getLocation(Number(id));

  if (!location) return notFound();

  return (
    <section>
      <DashboardHeader
        title={`Edit Location`}
        subtitle="Update location details and configuration"
      />
      <EditLocationForm location={location} />
    </section>
  );
}

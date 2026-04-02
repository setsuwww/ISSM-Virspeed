export const dynamic = "force-dynamic";

import { DashboardHeader } from "@/app/(content)/admin/dashboard/DashboardHeader";
import WorkHoursTabs from "./WorkHoursTabs";
import { prisma } from "@/_lib/prisma";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";

async function getWorkHoursData() {
  const [locations, shifts] = await Promise.all([
    prisma.location.findMany({
      select: {
        id: true,
        name: true,
        startTime: true,
        endTime: true,
        users: {
          where: {
            role: "EMPLOYEE",
            shiftId: null,
          },
          select: { id: true, name: true, email: true },
        },
      },
    }),

    prisma.shift.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        startTime: true,
        endTime: true,
        type: true,
        users: {
          where: { role: "EMPLOYEE" },
          select: { id: true, name: true, email: true },
        },
      },
    }),
  ]);

  return { locations, shifts };
}

export default async function Page() {
  const { locations, shifts } = await getWorkHoursData();

  return (
    <section>
      <DashboardHeader
        title="Work Hours"
        subtitle="Location & shift-based working hours"
      />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation title="Work Hours Overview" subtitle="Location & shift-based working hours" />
        </ContentForm.Header>

        <ContentForm.Body>
          <WorkHoursTabs
            locations={locations}
            shifts={shifts}
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  );
}

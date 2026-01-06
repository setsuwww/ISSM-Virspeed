export const dynamic = "force-dynamic";

import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader";
import WorkHoursTabs from "./WorkHoursTabs";
import { prisma } from "@/_lib/prisma";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";

async function getWorkHoursData() {
  const [divisions, shifts] = await Promise.all([
    prisma.division.findMany({
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
          select: { id: true, name: true },
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
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  return { divisions, shifts };
}

export default async function Page() {
  const { divisions, shifts } = await getWorkHoursData();

  return (
    <section>
      <DashboardHeader
        title="Work Hours"
        subtitle="Division & shift-based working hours"
      />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation
            heading="Work Hours Overview"
            subheading="Division & shift-based working hours"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <WorkHoursTabs
            divisions={divisions}
            shifts={shifts}
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  );
}

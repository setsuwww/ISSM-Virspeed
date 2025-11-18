import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader"
import ContentForm from "@/_components/content/ContentForm"
import { ContentInformation } from "@/_components/content/ContentInformation"
import { Pagination } from "@/app/admin/dashboard/Pagination"
import DivisionsTable from "./DivisionsTable"
import { prisma } from "@/_lib/prisma"
import { minutesToTime } from "@/_function/globalFunction"

const PAGE_SIZE = 5

export default async function Page({ searchParams }) {
  const page = Number(searchParams?.page) || 1
  const [divisions, total] = await Promise.all([
    prisma.division.findMany({ skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, location: true, type: true, status: true,
        latitude: true, longitude: true, radius: true,
        startTime: true, endTime: true, createdAt: true, updatedAt: true,
      },
    }),
    prisma.division.count(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const formattedDivisions = divisions.map((division) => ({...division,
    startTime: minutesToTime(division.startTime),
    endTime: minutesToTime(division.endTime)
  }))

  return (
    <section>
      <DashboardHeader title="Divisions" subtitle="List of Division divisions" />
      <ContentForm>
        <ContentForm.Header>
          <ContentInformation heading="List Divisions" subheading="Manage all Division data in this table"
            show={true} buttonText="Create Division" href="/admin/dashboard/users/divisions/create"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <DivisionsTable data={formattedDivisions} />
          <Pagination page={page} totalPages={totalPages} basePath="/admin/dashboard/divisions" />
        </ContentForm.Body>
      </ContentForm>
    </section>
  )
}
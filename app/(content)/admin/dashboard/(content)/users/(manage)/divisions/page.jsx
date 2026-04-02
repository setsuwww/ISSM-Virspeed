import { DashboardHeader } from "@/app/(content)/admin/dashboard/DashboardHeader";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { Pagination } from "@/app/(content)/admin/dashboard/Pagination";
import LocationsTable from "./LocationsTable";
import { getLocations } from "@/_servers/admin-action/divisionAction";

export default async function Page({ searchParams }) {
  const page = Number(searchParams?.page) || 1;

  const allowedLimits = [10, 20, 30];
  const limit = allowedLimits.includes(Number(searchParams?.limit))
    ? Number(searchParams?.limit)
    : 10;

  const { data: divisions, total } = await getLocations({
    page,
    limit,
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section>
      <DashboardHeader
        title="Locations"
        subtitle="List of Location divisions"
      />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation
            title="List divisions"
            subtitle="Manage all division data in this table"
            show
            buttonText="Create Location"
            href="/admin/dashboard/users/divisions/create"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <LocationsTable data={divisions} />

          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/dashboard/users/divisions"
            limit={limit}
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  );
}

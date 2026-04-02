import { DashboardHeader } from "@/app/(content)/admin/dashboard/DashboardHeader";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { Pagination } from "@/app/(content)/admin/dashboard/Pagination";
import LocationsTable from "./LocationsTable";
import { getLocations } from "@/_servers/admin-action/locationAction";

export default async function Page({ searchParams }) {
  const page = Number(searchParams?.page) || 1;

  const allowedLimits = [10, 20, 30];
  const limit = allowedLimits.includes(Number(searchParams?.limit))
    ? Number(searchParams?.limit)
    : 10;

  const { data: locations, total } = await getLocations({
    page,
    limit,
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section>
      <DashboardHeader
        title="Locations"
        subtitle="List of Location locations"
      />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation
            title="List locations"
            subtitle="Manage all location data in this table"
            show
            buttonText="Create Location"
            href="/admin/dashboard/users/locations/create"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <LocationsTable data={locations} />

          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/dashboard/users/locations"
            limit={limit}
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  );
}

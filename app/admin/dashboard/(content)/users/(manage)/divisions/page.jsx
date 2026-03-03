import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { Pagination } from "@/app/admin/dashboard/Pagination";
import DivisionsTable from "./DivisionsTable";
import { getDivisions } from "@/_servers/admin-action/divisionAction";

export default async function Page({ searchParams }) {
  const page = Number(searchParams?.page) || 1;

  const allowedLimits = [10, 20, 30];
  const limit = allowedLimits.includes(Number(searchParams?.limit))
    ? Number(searchParams?.limit)
    : 10;

  const { data: divisions, total } = await getDivisions({
    page,
    limit,
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section>
      <DashboardHeader
        title="Divisions"
        subtitle="List of Division divisions"
      />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation
            title="List divisions"
            subtitle="Manage all division data in this table"
            show
            buttonText="Create Division"
            href="/admin/dashboard/users/divisions/create"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <DivisionsTable data={divisions} />

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

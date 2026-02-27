import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { Pagination } from "@/app/admin/dashboard/Pagination";
import DivisionsTable from "./DivisionsTable";
import { getDivisions } from "@/_servers/admin-action/divisionAction";

export default async function Page({ searchParams }) {
  const page = Number(searchParams?.page) || 1;

  const { data: divisions, total } = await getDivisions({ page });

  const totalPages = Math.ceil(total / 10);

  return (
    <section>
      <DashboardHeader title="Divisions" subtitle="List of Division divisions" />
      <ContentForm>
        <ContentForm.Header>
          <ContentInformation
            title="List divisions"
            subtitle="Manage all division data in this table"
            show={true}
            buttonText="Create Division"
            href="/admin/dashboard/users/divisions/create"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <DivisionsTable data={divisions} />
          <Pagination page={page} totalPages={totalPages} basePath="/admin/dashboard/users/divisions" />
        </ContentForm.Body>
      </ContentForm>
    </section>
  );
}

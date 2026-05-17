import { notFound } from "next/navigation";
import ContentForm from "@/_components/common/ContentForm";
import { getUserMonthlyDetail } from "@/_servers/admin-services/monthly_report_action";
import dayjs from "dayjs";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { DashboardHeader } from "../../../../DashboardHeader";

export const revalidate = 0;

export default async function MonthlyReportDetailPage({ params, searchParams }) {
  const { userId } = await params;
  const p = await searchParams;

  const month = p?.month || String(dayjs().month() + 1);
  const year = p?.year || String(dayjs().year());

  const data = await getUserMonthlyDetail(userId, month, year);

  if (!data) return notFound();

  return (
    <section className="space-y-6">
      <DashboardHeader title="Users" subtitle="Users data detail" />
      <ContentForm>
        <ContentForm.Header>
          <ContentInformation title="User Report Detail" subtitle={`Attendance report for ${data.user.name} - ${dayjs(`${year}-${month}-01`).format('MMMM YYYY')}`} />
        </ContentForm.Header>

        <ContentForm.Body>
          <UserDetailDashboard data={data} month={month} year={year} />
        </ContentForm.Body>
      </ContentForm>
    </section>
  );
}

import { notFound } from "next/navigation";
import { DashboardHeader } from "../../../DashboardHeader";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { Pagination } from "../../../Pagination";
import { MonthlyReportTable } from "./MonthlyReportTable";
import { MonthlyReportFilters } from "./MonthlyReportFilters";
import { getMonthlyReport } from "@/_servers/admin-services/monthly_report_action";
import dayjs from "dayjs";

export const revalidate = 0; // Dynamic rendering for reports

export default async function MonthlyReportPage({ searchParams }) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const allowedLimits = [10, 20, 30];
  const limit = allowedLimits.includes(Number(params?.limit)) ? Number(params?.limit) : 10;
  
  const search = params?.search || "";
  const month = params?.month || String(dayjs().month() + 1);
  const year = params?.year || String(dayjs().year());

  const { data: reports, total } = await getMonthlyReport(page, limit, search, month, year);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (page > totalPages && totalPages > 0) return notFound();

  return (
    <section className="space-y-6">
      <DashboardHeader title="Monthly Report" subtitle="View user attendance and working hours recap" />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation 
            title="Monthly Attendance Recap" 
            subtitle="Detailed overview of attendance statistics and working hours for each user."
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <MonthlyReportFilters />
          <MonthlyReportTable data={reports} month={month} year={year} />
          
          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              basePath="/admin/dashboard/shifts/monthly-report"
            />
          </div>
        </ContentForm.Body>
      </ContentForm>
    </section>
  );
}

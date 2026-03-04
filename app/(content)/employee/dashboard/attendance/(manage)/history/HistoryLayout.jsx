import HistoryAnotherTabs from "./HistoryAnotherTabs"
import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"

export default function HistoryLayout({ children }) {
  return (
    <ContentForm>
      <ContentForm.Header>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full pb-2">
          <ContentInformation title="Your Attendance History" subtitle="Review all your attendance records"
            autoMargin={false}
          />
          <HistoryAnotherTabs />
        </div>
      </ContentForm.Header>

      <ContentForm.Body>
        {children}
      </ContentForm.Body>
    </ContentForm>
  )
}

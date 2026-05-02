import { getCurrentUser } from "@/_lib/auth"
import { prisma } from "@/_lib/prisma"
import EventList from "./EventList"
import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"
import ScheduleToEvent from "../ScheduleToEvent"

export default async function Page() {
    const user = await getCurrentUser()
    if (!user) return <div>User not authenticated</div>

    const schedulesData = await prisma.schedule.findMany({
        where: {
            users: {
                some: { userId: user.id }
            }
        },
        orderBy: { startDate: "asc" },
        include: {
            users: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    })

    const schedules = schedulesData.map(item => ({
        ...item,
        totalUsers: item.users.length,
        usersPreview: item.users.map(u => ({
            id: u.user.id,
            name: u.user.name
        })).slice(0, 5)
    }))

    return (
        <ContentForm>
            <ContentForm.Header>
                <div className="flex items-center justify-between">
                    <ContentInformation title="Event Schedules" subtitle="Manage your event schedules" />
                    <ScheduleToEvent />
                </div>
            </ContentForm.Header>
            <ContentForm.Body>
                <EventList schedules={schedules} />
            </ContentForm.Body>
        </ContentForm>
    )
}

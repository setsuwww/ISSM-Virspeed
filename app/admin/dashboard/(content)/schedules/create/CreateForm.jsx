"use client"

import { Loader } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

import { useScheduleStore } from "@/_stores/useScheduleStore"
import { useToast } from "@/_components/client/Toast-Provider"
import { createSchedule } from "@/_components/server/scheduleAction"

import { Label } from "@/_components/ui/Label"
import { Input } from "@/_components/ui/Input"
import { Button } from "@/_components/ui/Button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/_components/ui/Select"

import { DashboardHeader } from "../../../DashboardHeader"
import ContentForm from "@/_components/content/ContentForm"
import { ContentInformation } from "@/_components/content/ContentInformation"
import InputAssignUserShift from "./InputAssignUserShift"
import { Textarea } from "@/_components/ui/Textarea"

export default function CreateForm({ users, shifts }) {
  const router = useRouter()
  const { addToast } = useToast()

  const { form, events, loading, setFormField, setLoading, resetForm, totalAssignedUsers } = useScheduleStore()

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      if (!form.title.trim() || !form.description.trim() || events.length === 0) {
        addToast("Fill all required form", { type: "error" })
        return
      }

      setLoading(true)
      try { const userIds = Array.from( new Set(events.flatMap((e) => e.users.map((u) => u.id).filter(Boolean))))

        const payload = {
          title: form.title, description: form.description, frequency: form.frequency,
          startDate: events[0]?.startDate, endDate: events[0]?.endDate,
          startTime: events[0]?.startTime, endTime: events[0]?.endTime,
          userIds,
        }

        const result = await createSchedule(payload)

        if (result.success) { addToast("Schedule created successfully", { type: "success" })
          resetForm()
          router.push("/admin/dashboard/schedules")
        } else { addToast("Schedule failed created", { type: "error" })}
      } catch (error) { addToast("Schedule failed created", { type: "error" })} 
      finally { setLoading(false)}
    },
    [form, events, setLoading, addToast, resetForm, router]
  )

  return (
    <section>
      <DashboardHeader title="Create Schedules" subtitle="Manage schedules data" />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation heading="Schedule Form" subheading="Create a new schedule and assign users"
            show={true} buttonText="Back" variant="outline" href="/admin/dashboard/schedules"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="space-y-2 max-w-sm">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={(e) => setFormField("title", e.target.value)}
                  placeholder="Enter schedule title" required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={(e) => setFormField("description", e.target.value)}
                  placeholder="Enter schedule description..." required className="h-32"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Select Frequency</Label>
              <Select value={form.frequency} onValueChange={(value) => setFormField("frequency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                  <SelectItem value="ONCE">Once</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <InputAssignUserShift users={users} />

            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                {totalAssignedUsers()} users assigned • {events.length} dates scheduled
              </div>
              <div className="flex items-center space-x-2">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading 
                    ? (<><Loader className="w-4 h-4 animate-spin" /> Creating...</>) 
                    : ("Create Schedule")
                  }
                </Button>
              </div>
            </div>
          </form>
        </ContentForm.Body>
      </ContentForm>
    </section>
  )
}

"use client"

import { useState, useCallback, useEffect } from "react"
import { Loader } from "lucide-react"

import UpdateAssignUserShift from "./UpdateAssignUserShift"
import { Label } from "@/_components/ui/Label"
import { Input } from "@/_components/ui/Input"
import { Button } from "@/_components/ui/Button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/_components/ui/Select"
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader"
import ContentForm from "@/_components/content/ContentForm"
import { ContentInformation } from "@/_components/content/ContentInformation"
import { updateSchedule } from "@/_components/server/scheduleAction"
import { useToast } from "@/_components/ui/ToastProvider"

export default function EditForm({ schedule, users, shifts }) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({ title: "", description: "", frequency: "ONCE" })

  useEffect(() => {
    if (schedule) {
      setForm({
        title: schedule.title ?? "", description: schedule.description ?? "", frequency: schedule.frequency ?? "ONCE",
      })

      setEvents([
        {
          startDate: schedule.startDate || "", endDate: schedule.endDate || "",
          startTime: schedule.startTime || "", endTime: schedule.endTime || "",
          users: schedule.users || [],
        },
      ])
    }
  }, [schedule])

  const handleChange = useCallback((field, value) => { setForm((prev) => ({ ...prev, [field]: value }))}, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title.trim() || !form.description.trim() || events.length === 0) { 
      addToast("Please fill all required fields", { type: "warning" })
      return
    }

    setLoading(true)
    try { const userIds = Array.from(new Set(events.flatMap((e) => e.users.map((u) => u.id).filter(Boolean))))
      const payload = {
        id: schedule.id, title: form.title, description: form.description, frequency: form.frequency,
        startDate: events[0]?.startDate ?? null, endDate: events[0]?.endDate ?? null,
        startTime: events[0]?.startTime ?? null, endTime: events[0]?.endTime ?? null,
        userIds,
      }

      const res = await updateSchedule(payload)

      if (res?.success) { addToast("Schedule updated successfully", { type: "success" })} 
      else { addToast(res?.message || "Failed to update schedule", { type: "error" })}
    } 
    catch (error) { addToast("Unexpected error occurred while updating schedule", { type: "error" })} 
    finally { setLoading(false)}
  }

  return (
    <section>
      <DashboardHeader title="Edit Schedule" subtitle="Update schedule details" />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation
            heading="Edit Schedule Form"
            subheading="Modify existing schedule and assigned users"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter schedule title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={form.description} onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter schedule description"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Select Frequency</Label>
              <Select value={form.frequency} onValueChange={(value) => handleChange("frequency", value)}>
                <SelectTrigger className="border-slate-200 focus:border-slate-400">
                  <SelectValue placeholder="Select Frequency" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                  <SelectItem value="ONCE">Once</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <UpdateAssignUserShift events={events} setEvents={setEvents} users={users} />

            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                {events.reduce((acc, e) => acc + e.users.length, 0)} users assigned •{" "}
                {events.length} dates scheduled
              </div>

              <div className="flex items-center space-x-2">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading 
                    ? (<><Loader className="w-4 h-4 animate-spin mr-2" />Updating...</>) 
                    : ("Update Schedule")
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

"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

import { Loader } from "lucide-react"

import InputAssignUserShift from "./InputAssignUserShift"
import { createSchedule } from "@/_components/server/scheduleAction"

import { Label } from "@/_components/ui/Label"
import { Input } from "@/_components/ui/Input"
import { Button } from "@/_components/ui/Button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/_components/ui/Select"
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader"
import ContentForm from "@/_components/content/ContentForm"
import { ContentInformation } from "@/_components/content/ContentInformation"


import { useToast } from "@/_components/client/Toast-Provider"
import { useRouter } from "next/navigation"

export default function CreateForm({ users, shifts }) {
  const { addToast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeDate, setActiveDate] = useState(null)
  const [events, setEvents] = useState([])

  const [form, setForm] = useState({
    title: "", description: "", frequency: "ONCE",
  })

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title.trim() || !form.description.trim() || events.length === 0) {
      toast.error("Please fill all required fields")
      return
    }

    setLoading(true)
    try {
      const userIds = Array.from(new Set(events.flatMap((e) => e.users.map((u) => u.id).filter(Boolean))))

      const payload = {
        title: form.title,
        description: form.description,
        frequency: form.frequency,
        startDate: events[0]?.startDate,
        endDate: events[0]?.endDate,
        startTime: events[0]?.startTime,
        endTime: events[0]?.endTime,
        userIds,
      }

      const result = await createSchedule(payload)

      if (result.success) {
        addToast("Schedule created successfully", { type: "success" })
        setForm({ title: "", description: "", frequency: "ONCE", })
        setEvents([])
        setActiveDate(null)
        router.push("/admin/dashboard/schedules")
      } else {
        addToast("Schedule failed created", { type: "error" })
      }
    } catch (error) {
      console.error("Error creating schedule:", error)
      addToast("Schedule failed created", { type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <DashboardHeader title="Create Schedules" subtitle="Manage schedules data" />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation heading="Schedule Form" subheading="Create a new schedule and assign users" />
        </ContentForm.Header>

        <ContentForm.Body>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter schedule title" required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={form.description} onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter schedule description" required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Select Frequency</Label>
              <Select value={form.frequency} onValueChange={(value) => handleChange("frequency", value)}>
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

            <InputAssignUserShift
              events={events} setEvents={setEvents}
              users={users}
              activeDate={activeDate} setActiveDate={setActiveDate}
            />

            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                {events.reduce((acc, e) => acc + e.users.length, 0)} users assigned •{" "}
                {events.length} dates scheduled
              </div>
              <div className="flex items-center space-x-2">
                <Button type="button" variant="outline" disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (<><Loader className="w-4 h-4 animate-spin" /> Creating...</>) : "Create Schedule"}
                </Button>
              </div>
            </div>
          </form>
        </ContentForm.Body>
      </ContentForm>
    </section>
  )
}

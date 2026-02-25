"use client"

import { useState, useMemo, useTransition } from "react"
import { ChevronLeft, Loader } from 'lucide-react';
import { useRouter } from "next/navigation"
import { useToast } from "@/_contexts/Toast-Provider"
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader"

import { Button } from "@/_components/ui/Button"
import { Input } from "@/_components/ui/Input"
import { RadioButton } from "@/_components/ui/RadioButton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select"
import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"
import { ContentList } from "@/_components/common/ContentList"
import { Label } from "@/_components/ui/Label"

import { bulkCreateUser, createUser } from "@/_servers/admin-action/userAction"
import { capitalize, minutesToTime } from "@/_functions/globalFunction"
import { roleOptions } from "@/_constants/userConstants"

import { CreateUserFromExcel } from "./CreateUserFromExcel"
import UserExcelTemplate from "./UserExcelTemplate"

export default function CreateForm({ divisions, shifts }) {
  const router = useRouter()
  const { addToast } = useToast()

  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "USER",
    divisionId: "", workMode: "WORK_HOURS", shiftId: "",
  })

  const [excelRows, setExcelRows] = useState([])
  const [inputMode, setInputMode] = useState("MANUAL")
  const [isPending, startTransition] = useTransition()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCustomChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    startTransition(async () => {
      if (inputMode === "EXCEL") {
        if (!excelRows.length) {
          addToast("No Excel data to import", { type: "error" })
          return
        }

        try {
          const res = await bulkCreateUser(excelRows)

          if (res.success) {
            addToast(`${res.count} users imported`, {
              type: "success",
              title: "Import Success",
            })
            router.push("/admin/dashboard/users")
          } else {
            addToast(res.message || "Failed to import users", {
              type: "error",
            })
          }
        } catch (err) {
          addToast("Error importing Excel users", { type: "error" })
          console.error(err)
        }

        return
      }

      const fd = new FormData()
      Object.entries(form).forEach(([key, value]) => fd.append(key, value))

      const res = await createUser(fd)
      if (res.success) {
        addToast(res.message || "User created successfully!", {
          type: "success",
          title: "Success",
        })
        e.target.reset()
        router.push("/admin/dashboard/users")
      } else {
        addToast(res.message || "Failed to create user.", {
          type: "error",
          title: "Error",
        })
      }
    })
  }

  const selectedDivision = useMemo(
    () => divisions.find(o => String(o.id) === form.divisionId),
    [form.divisionId, divisions]
  )
  const defaultdivisionHour = useMemo(
    () => selectedDivision ? { startTime: selectedDivision.startTime, endTime: selectedDivision.endTime } : null,
    [selectedDivision]
  )
  const availableShifts = useMemo(() => selectedDivision?.shifts || [], [selectedDivision])

  return (
    <section>
      <DashboardHeader title="Create User" subtitle="Insert name, email, password, role, and work mode (shift or division hours)" />

      <ContentForm>
        <form onSubmit={handleSubmit} className="space-y-2">
          <ContentForm.Header>
            <ContentInformation title="Users form" subtitle="Insert users data & create new user"
              show variant="outline" buttonText="Back" buttonIcon={<ChevronLeft />} href="/admin/dashboard/users"
            />
          </ContentForm.Header>

          <ContentForm.Body>
            <div className="space-y-6">
              <div>
                <CreateUserFromExcel
                  onImported={(rows) => {
                    setInputMode("EXCEL")
                    setExcelRows(rows)
                  }}
                />
                {excelRows.length > 0 && (
                  <div className="mt-4 p-2 border rounded">
                    {excelRows.map((row, idx) => (
                      <p key={idx}>{row.name} - {row.email} - {row.password} - {row.role} - {row.workMode} - {row.shift ? row.shift : "Null" }</p>
                    ))}
                  </div>
                )}
                <UserExcelTemplate />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  Username <span className="text-rose-500">*</span>
                </Label>
                <Input placeholder="Username" name="name" disabled={inputMode === "EXCEL"}
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-rose-500">*</span>
                </Label>
                <Input placeholder="Users email" type="email" name="email" disabled={inputMode === "EXCEL"}
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <ContentInformation title="Private" subtitle="Users private password & role" />

              <div className="space-y-2 mt-8">
                <Label htmlFor="password">
                  Password <span className="text-rose-500">*</span>
                </Label>
                <Input placeholder="Users password" type="password" name="password" disabled={inputMode === "EXCEL"}
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role <span className="text-rose-500">*</span></Label>
                <RadioButton name="role"
                  options={roleOptions} value={form.role}
                  onChange={(v) => handleCustomChange("role", v)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="divisionId">Division Assignment</Label>
                <Select value={form.divisionId} onValueChange={(v) => handleCustomChange("divisionId", v)}>
                  <SelectTrigger className="w-1/2">
                    <SelectValue placeholder="Select an division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">-</SelectItem>
                    {divisions.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {capitalize(d.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Work Mode</Label>
                <RadioButton name="workMode" value={form.workMode}
                  onChange={(v) => handleCustomChange("workMode", v)}
                  options={[
                    { label: "Work Hours", value: "WORK_HOURS" },
                    { label: "Shift Hours", value: "SHIFT" },
                  ]}
                />
                <ContentList type="i"
                  items={[
                    "Work Hours : follow the default division work startTime & endTime",
                    "Shift Hours : follow the shifts division work startTime & endTime",
                  ]}
                />
              </div>

              {form.workMode === "WORK_HOURS" && defaultdivisionHour && (
                <div className="p-3 rounded-md bg-white/30 border text-sm">
                  <p>
                    <strong className="text-slate-600">Division Hours : </strong> {minutesToTime(defaultdivisionHour.startTime)} - {minutesToTime(defaultdivisionHour.endTime)}
                  </p>
                </div>
              )}

              {form.workMode === "SHIFT" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="shiftId">Shift Assignment</Label>
                    <Select value={form.shiftId} onValueChange={(v) => handleCustomChange("shiftId", v)}
                      disabled={availableShifts.length === 0}
                    >
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder={
                          availableShifts.length === 0 ? "No shifts found" : "Select a Shift"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">-</SelectItem>
                        {availableShifts.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {capitalize(s.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {availableShifts.length === 0 && (
                    <ContentList type="w" items={["There is no shift detected or created in this division to assign"]} />
                  )}
                </>
              )}
            </div>
          </ContentForm.Body>

          <ContentForm.Footer>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? (<><Loader className="w-4 h-4 animate-spin" /> Creating...</>)
                : "Create User"
              }
            </Button>
          </ContentForm.Footer>
        </form>
      </ContentForm>
    </section>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useUserStore } from "@/_stores/useUserStore"
import { updateProfile } from "@/_server/profileAction"
import { toast } from "sonner"

import { CircleUserRound, LogOut, Trash2, Save, Pencil, Building2, CalendarDays, Calendar } from "lucide-react"

import { Card, CardHeader, CardContent, CardFooter } from "@/_components/ui/Card"
import { Input } from "@/_components/ui/Input"
import { Button } from "@/_components/ui/Button"
import { Badge } from "@/_components/ui/Badge"
import { Label } from "@/_components/ui/Label"

import { profilesRoleStyles, roleStyles } from "@/_constants/roleConstants"
import { capitalize, minutesToTime } from "@/_function/globalFunction"
import { format } from "date-fns"
import AppInformation from "./AppInformation"
import { ContentInformation } from "@/_components/common/ContentInformation"

export function ProfileView({ user }) {
  const { setUser } = useUserStore()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
  })

  useEffect(() => {
    if (!user) return
    setUser(user)
    setForm({
      name: user.name || "",
      email: user.email || "",
    })
  }, [user, setUser])

  if (!user) {
    return (
      <p className="text-slate-500 text-center py-10">
        Data profil tidak tersedia.
      </p>
    )
  }

  const handleSave = async () => {
    const res = await updateProfile({ id: user.id, ...form })
    if (!res.success) {
      toast.error(res.message)
      return
    }
    setUser(res.user)
    toast.success("Profil berhasil diperbarui")
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-lg border border-slate-200 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <div className={`${profilesRoleStyles[capitalize(user.role)]} p-2 rounded-full bg-slate-100 ring-1 ring-slate-200`}>
              <CircleUserRound className="w-6 h-6 text-white" strokeWidth={1} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {user.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                {user.email}
              </div>
              <div
                className={`mt-1 w-fit ${roleStyles[capitalize(user.role)] ?? ""}`}
              >
                {user.role}
              </div>
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing((v) => !v)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 px-6">
          {isEditing && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg grid max-w-md gap-4">
              <h1 className="text-lg text-blue-500 font-bold">Edit account</h1>
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsEditing(false)} className="bg-white">
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
                  <Save className="w-4 h-4" />
                  Save Change
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Info label="Division" icon={Building2}>
              {user.division?.name ?? "-"}
            </Info>

            <Info label="Shift" icon={Calendar}>
              {user.shift?.name ?? "-"}
            </Info>

            <Info label="Joined at" icon={CalendarDays}>
              {user.createdAt
                ? format(new Date(user.createdAt), "dd MMMM yyyy")
                : "-"}
            </Info>

            <Info label="Updated at" icon={CalendarDays}>
              {user.createdAt
                ? format(new Date(user.updatedAt), "dd MMMM yyyy")
                : "-"}
            </Info>
          </div>

          {user.shift && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2 mt-6">
                <ContentInformation heading="Shift Information" subheading="See your shift information, your start time & end time here" />
              </div>

              <p className="text-sm text-slate-700">
                Shift : {user.shift.name ?? user.shift.type}
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium text-emerald-500">
                  {minutesToTime(user.shift.startTime)}
                </span>
                {" – "}
                <span className="font-medium text-rose-500">
                  {minutesToTime(user.shift.endTime)}
                </span>
              </p>
            </div>
          )}

        </CardContent>

        <CardFooter className="flex items-start border-t px-6 py-4">
          <Button variant="outline" className="mt-2 text-red-500 hover:text-red-700">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>

          <Button variant="destructive" className="mt-2">
            <Trash2 className="w-4 h-4" />
            Delete account
          </Button>
        </CardFooter>
      </Card>
      <AppInformation />
    </div>
  )
}

function Info({ label, icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-slate-200 p-2 rounded-full">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800">
          {children}
        </p>
      </div>
    </div>
  )
}

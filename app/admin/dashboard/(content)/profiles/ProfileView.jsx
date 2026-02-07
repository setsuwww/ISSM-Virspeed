"use client"

import { useEffect, useState } from "react"
import { useUserStore } from "@/_stores/useUserStore"
import { updateProfile } from "@/_server/profileAction"
import { toast } from "sonner"

import { CircleUserRound, LogOut, Trash2, Save, Pencil, Building2, CalendarDays } from "lucide-react"

import { Card, CardHeader, CardContent, CardFooter } from "@/_components/ui/Card"
import { Input } from "@/_components/ui/Input"
import { Button } from "@/_components/ui/Button"
import { Badge } from "@/_components/ui/Badge"
import { Label } from "@/_components/ui/Label"

import { roleStyles } from "@/_constants/roleConstants"
import { capitalize, minutesToTime } from "@/_function/globalFunction"
import { format } from "date-fns"
import AppInformation from "./AppInformation"

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
      <Card className="rounded-2xl border border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-slate-100 ring-1 ring-slate-200">
              <CircleUserRound className="w-10 h-10 text-slate-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {user.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                {user.email}
              </div>
              <Badge
                className={`mt-1 w-fit ${roleStyles[capitalize(user.role)] ?? ""}`}
              >
                {capitalize(user.role)}
              </Badge>
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
            <div className="grid max-w-md gap-4">
              <div className="space-y-1">
                <Label>Full name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Info label="Division" icon={Building2}>
              {user.division?.name ?? "-"}
            </Info>

            <Info label="Joined at" icon={CalendarDays}>
              {user.createdAt
                ? format(new Date(user.createdAt), "dd MMMM yyyy")
                : "-"}
            </Info>
          </div>

          {user.shift && (
            <div className="rounded-xl border bg-slate-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-md font-medium text-slate-700">
                  Shift Information
                </h3>
              </div>

              <p className="text-sm text-slate-700">
                Shift : {user.shift.name ?? user.shift.type}
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium text-emerald-600">
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

        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button variant="ghost" className="text-rose-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete account
          </Button>

          <Button variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
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

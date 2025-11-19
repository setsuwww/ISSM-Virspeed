"use client"

import { useEffect, useState } from "react"
import { useUserStore } from "@/_stores/useUserStore"
import { updateUserProfile, updateShiftTime } from "@/_components/server/profileAction"
import { toast } from "sonner"

import { CircleUserRound, LogOut, Trash2, Save, Clock } from "lucide-react"
import { Card, CardHeader, CardContent, CardFooter } from "@/_components/ui/Card"
import { Input } from "@/_components/ui/Input"
import { Button } from "@/_components/ui/Button"
import { Badge } from "@/_components/ui/Badge"
import { roleStyles } from "@/_constants/roleConstants"
import { capitalize, minutesToTime } from "@/_function/globalFunction"
import { Label } from "@/_components/ui/Label"

export function ProfileView({ user }) {
  const { setUser } = useUserStore()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", divisionId: "", shiftId: "" })
  const [shiftForm, setShiftForm] = useState({ id: "", startTime: "", endTime: "" })

  useEffect(() => {
    if (user) {
      setUser(user)
      setForm({
        name: user.name || "",
        email: user.email || "",
        divisionId: user.division?.id || "",
        shiftId: user.shift?.id || "",
      })
      setShiftForm({
        id: user.shift?.id || "",
        startTime: user.shift?.startTime || "",
        endTime: user.shift?.endTime || "",
      })
    }
  }, [user, setUser])

  if (!user) return <p className="text-slate-500 text-center py-8">Tidak ada data user.</p>

  const handleSaveProfile = async () => {
    const res = await updateUserProfile({ id: user.id, ...form })
    if (res.success) {
      setUser(res.user)
      toast.success("Profil berhasil diperbarui")
      setIsEditing(false)
    } else {
      toast.error(res.message)
    }
  }

  const handleSaveShift = async () => {
    const res = await updateShiftTime(shiftForm)
    if (res.success) {
      toast.success("Jam shift diperbarui")
      setUser((prev) => ({ ...prev, shift: res.shift }))
    } else {
      toast.error(res.message)
    }
  }

  const handleLogout = () => {
    toast.info("Berhasil logout (demo)")
  }

  const handleDelete = () => {
    toast.error("Fitur delete account belum diaktifkan.")
  }

  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <CardHeader className="flex flex-col items-center space-y-3 pt-6">
        <div className="relative">
          <div className="p-4 bg-slate-100 rounded-full ring-2 ring-slate-200">
            <CircleUserRound className="w-12 h-12 text-slate-600" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-slate-800">{user.name}</h2>
          <p className="text-slate-500 text-sm">{user.email}</p>
          <Badge className={`${roleStyles[capitalize(user.role)] ?? ""}`}>
            {capitalize(user.role)}
          </Badge>
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing((prev) => !prev)}
            className="text-xs"
          >
            {isEditing ? "Batal" : "Edit Profil"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing && (
          <div className={`transition-all duration-300 ${isEditing ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
            <div className="flex justify-center items-center py-6">
              <div className="space-y-2 w-full max-w-sm">
                <Label>New name <span className="text-red-500">*</span></Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama"
                />
                <Label>New email <span className="text-red-500">*</span></Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email"
                />
                <Button onClick={handleSaveProfile} className="w-full">
                  <Save className="w-4 h-4 mr-1" /> Simpan Profil
                </Button>
              </div>
            </div>
          </div>
        )}

        {user.shift && (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-slate-600">Your shift information</h3>
            </div>
            <div>
              <p className="text-sm text-slate-600">
                <span className="font-medium">{user.shift.name}</span>
              </p>
              <p className="text-sm mt-1">
                <span className="text-teal-400 font-semibold">
                  {minutesToTime(user.shift.startTime)}
                </span>{" "}
                -{" "}
                <span className="text-rose-400 font-semibold">
                  {minutesToTime(user.shift.endTime)}
                </span>
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-4">
        <Button variant="ghost" className="text-rose-600 hover:text-rose-700" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-1" /> Hapus Akun
        </Button>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-1" /> Logout
        </Button>
      </CardFooter>
    </Card>
  )
}

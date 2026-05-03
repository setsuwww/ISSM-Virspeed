"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/_stores/useUserStore"
import { updateChangePassword, updateProfile } from "@/_servers/profile_action"
import { deleteUserById } from "@/_servers/admin-services/user_action"
import { toast } from "sonner"

import { CircleUserRound, LogOut, Trash2, Save, Building2, CalendarDays, SquarePen, Clock } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/_components/ui/Dialog"
import { Card, CardHeader, CardContent, CardFooter } from "@/_components/ui/Card"
import { Input } from "@/_components/ui/Input"
import { Button } from "@/_components/ui/Button"
import { Label } from "@/_components/ui/Label"
import { Badge } from "@/_components/ui/Badge"

import { profilesRoleStyles, roleStyles } from "@/_components/_constants/theme/userTheme"
import { capitalize, minutesToTime, safeFormat } from "@/_functions/globalFunction"
import { format } from "date-fns"
import { ContentInformation } from "@/_components/common/ContentInformation"
import Link from "next/link"
import { shiftStyles } from "@/_components/_constants/shiftConstants"

export function ProfileView({ user, todayAssignment }) {
  const router = useRouter()
  const { setUser } = useUserStore()

  const [activeModal, setActiveModal] = useState(null)

  const [form, setForm] = useState({
    name: "", email: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  })

  useEffect(() => {
    if (!user) return

    setUser(user)
    setForm({ name: user.name || "", email: user.email || "" })
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
    setActiveModal(null)
  }

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Semua field password wajib diisi")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok")
      return
    }

    const res = await updateChangePassword({
      id: user.id, currentPassword, newPassword,
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success("Password berhasil diperbarui")
    setPasswordForm({
      currentPassword: "", newPassword: "", confirmPassword: "",
    })
    setActiveModal(null)
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm("Apakah Anda yakin ingin menghapus akun ini?")

    if (!confirmed) return

    const res = await deleteUserById(user.id)

    if (!res?.success) {
      toast.error("Gagal menghapus akun")
      return
    }

    toast.success("Akun berhasil dihapus")
    router.replace("/auth/logout")
  }

  const handleLogout = async () => {
    router.replace("/auth/logout")
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
              <div className="text-sm text-slate-500">{user.email}</div>
              <div className={`mt-1 w-fit px-2 rounded-md py-0.5 text-xs ${roleStyles[user.role] ?? ""}`}>
                {user.role}
              </div>
            </div>
          </div>

          <Button variant="ghost" className="text-blue-500 hover:text-blue-700" onClick={() => setActiveModal("edit")}>
            <SquarePen className="w-3 h-3" />
            Edit Profile
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 px-6">
          <Dialog open={activeModal !== null} onOpenChange={() => setActiveModal(null)}>
            <DialogContent className="sm:max-w-md animate-bouncy" variant={activeModal === "edit" ? "blue" : "warning"}>

              {activeModal === "edit" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4 py-2">
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
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setActiveModal(null)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Save className="w-4 h-4" />
                      Save Change
                    </Button>
                  </DialogFooter>
                </>
              )}

              {activeModal === "password" && (
                <>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4 py-2">
                    <div className="space-y-2">
                      <Label>Current</Label>
                      <Input
                        type="password"
                        placeholder="Current password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                      />
                      <Link href="/auth/forgot-password" className="text-xs text-blue-500 hover:text-blue-300" >Forgot password?</Link>
                    </div>

                    <div className="space-y-2">
                      <Label>New</Label>
                      <Input
                        type="password"
                        placeholder="New password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Confirm</Label>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setActiveModal(null)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      <Save className="w-4 h-4" />
                      Save Change
                    </Button>
                  </DialogFooter>
                </>
              )}

            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <Info label="Location" icon={Building2}>
              {user.location?.name ?? "-"}
            </Info>

            <Info label="Shift" icon={Clock}>
              {user.shift?.name ?? "-"}
            </Info>

            <Info label="Joined at" icon={CalendarDays}>
              {user.createdAt
                ? format(new Date(user.createdAt), "dd MMMM yyyy")
                : "-"}
            </Info>

            <Info label="Updated at" icon={CalendarDays}>
              {user.updatedAt
                ? format(new Date(user.updatedAt), "dd MMMM yyyy")
                : "-"}
            </Info>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Default Shift Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-slate-200 p-1.5 rounded-md">
                  <Clock className="w-4 h-4 text-slate-800" />
                </div>
                <h3 className="font-semibold text-slate-800">Default Shift</h3>
              </div>
              {user.shift ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">{user.shift.name}</p>
                  <p className="text-xs text-slate-500">
                    Start Time : {minutesToTime(user.shift.startTime)} - End Time : {minutesToTime(user.shift.endTime)}
                  </p>
                  <Badge className={shiftStyles[user.shift.type]}>{user.shift.type}</Badge>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No default shift assigned</p>
              )}
            </div>

            {/* Today's Assignment Card */}
            <div className={`${todayAssignment ? 'bg-blue-50/30 border-blue-300 shadow-xs' : 'bg-slate-50 border-slate-200'} rounded-lg p-4 border transition-all duration-300`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`${todayAssignment ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'} p-1.5 rounded-md`}>
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-800">Today's Assignment</h3>
              </div>
              {todayAssignment ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">{todayAssignment.shift?.name || 'No Shift Name'}</p>
                  <p className="text-xs text-slate-500">
                    Start Time : {todayAssignment.shift ? `${minutesToTime(todayAssignment.shift.startTime)}` : '-'} - End Time : {todayAssignment.shift ? `${minutesToTime(todayAssignment.shift.endTime)}` : '-'}
                  </p>
                  {todayAssignment.shift && (
                    <Badge className={shiftStyles[todayAssignment.shift.type]}>{todayAssignment.shift.type}</Badge>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 italic">No assignment for today</p>
                  <p className="text-[10px] text-slate-400">System will use your default shift if applicable</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
          <Button
            variant="outline"
            className="text-yellow-500 hover:text-yellow-700"
            onClick={() => setActiveModal("password")}
          >
            Change password
          </Button>

          <div className="space-x-2">
            <Button
              variant="outline"
              className="text-red-500 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="w-4 h-4" />
              Delete account
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

function Info({ label, icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-slate-200/50 p-2 rounded-full">
        <Icon className="w-4 h-4 text-slate-500" />
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

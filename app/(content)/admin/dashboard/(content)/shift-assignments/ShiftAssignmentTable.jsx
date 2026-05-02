"use client"

import Link from "next/link"
import { Building2, Calendar, CircleUserRound } from "lucide-react"

import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/_components/ui/Table"

import { Badge } from "@/_components/ui/Badge"
import { roleStyles } from "@/_components/_constants/theme/userTheme"
import { shiftDots } from "@/_components/_constants/shiftConstants"
import { capitalize, minutesToTime } from "@/_functions/globalFunction"
import { Checkbox } from "@/_components/ui/Checkbox"

export default function ShiftAssignmentTable({
    users = [],
    selectedIds = [],
    onToggleSelect,
    onSelectAll,
}) {

    const selectedSet = new Set(selectedIds)
    const isAllSelected = users.length > 0 && users.every(u => selectedSet.has(u.id))

    return (
        <div className="bg-white border border-slate-200 overflow-hidden rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="pl-6 w-10">
                            <Checkbox
                                checked={isAllSelected}
                                onCheckedChange={(checked) => onSelectAll(!!checked)}
                            />
                        </TableHead>
                        <TableHead className="pl-10">Employees</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Default Shift</TableHead>
                        <TableHead className="pr-10 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-slate-500 italic">
                                No employees found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map(user => (
                            <TableRow key={user.id} className="hover:bg-slate-50">

                                <TableCell className="pl-6 w-10">
                                    <Checkbox
                                        checked={selectedSet.has(user.id)}
                                        onCheckedChange={(checked) => onToggleSelect(user.id, !!checked)}
                                    />
                                </TableCell>

                                <TableCell className="pl-10">
                                    <div className="flex items-center gap-3">
                                        <div className="icon-parent">
                                            <CircleUserRound className="icon" strokeWidth={1} />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-700">
                                                    {user.name}
                                                </span>

                                                <Badge
                                                    variant="outline"
                                                    className="px-1.5 py-0 text-[10px] uppercase flex items-center gap-1.5 border-slate-200"
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"
                                                            }`}
                                                    />
                                                    {user.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>

                                            <span className="text-xs text-slate-400">
                                                {user.email}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* ROLE */}
                                <TableCell>
                                    <Badge className={roleStyles[user.role]}>
                                        {user.role}
                                    </Badge>
                                </TableCell>

                                {/* LOCATION */}
                                <TableCell>
                                    <Badge className="bg-blue-50 text-blue-700 border-sky-100">
                                        <Building2 className="mr-1" size={16} />
                                        {user.location?.name}
                                    </Badge>
                                </TableCell>

                                {/* SHIFT */}
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        {shiftDots[user.shift?.type]}

                                        <div className="flex flex-col text-sm text-slate-600">
                                            <p className="font-semibold">
                                                {capitalize(user.shift?.type)}
                                            </p>

                                            <p className="text-xs text-slate-400">
                                                {minutesToTime(user.shift?.startTime)} -{" "}
                                                {minutesToTime(user.shift?.endTime)}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* ACTION */}
                                <TableCell className="pr-10 text-right">
                                    <Link
                                        href={`/admin/dashboard/shift-assignments/${user.id}`}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        View Schedule
                                    </Link>
                                </TableCell>

                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

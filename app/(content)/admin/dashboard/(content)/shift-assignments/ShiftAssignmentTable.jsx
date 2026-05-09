"use client"

import Link from "next/link"
import { Building2, Calendar, CircleUserRound } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

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
import { cn } from "@/_lib/utils"

function ScheduleStatusBadge({ info, userName }) {
	const [isHovered, setIsHovered] = useState(false)

	const getBadgeStyles = (totalMonths) => {
		if (totalMonths === 0) {
			return "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
		}
		if (totalMonths === 1) {
			return "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
		}
		return "bg-lime-50 text-lime-600 border-lime-100 hover:bg-lime-100"
	}

	return (
		<div
			className="relative inline-block"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<Badge
				variant="outline"
				className={cn(
					"cursor-help transition-all duration-300 font-bold px-2.5 py-1 text-[10px] tracking-wide",
					getBadgeStyles(info.totalMonths)
				)}
			>
				{info.status}
			</Badge>

			<AnimatePresence>
				{isHovered && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 10, x: "-50%" }}
						animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
						exit={{ opacity: 0, scale: 0.95, y: 10, x: "-50%" }}
						transition={{ type: "spring", stiffness: 300, damping: 25 }}
						className="absolute z-50 bottom-full left-1/2 mb-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 p-5 pointer-events-none"
					>
						<div className="space-y-4">
							<div className="border-b border-slate-50">
								<h4 className="font-semibold text-slate-800 text-sm leading-tight">
									{userName}
								</h4>
								<p className="text-[10px] text-slate-400 mt-0.5 font-base tracking-wide">
									Scheduling Statistics
								</p>
							</div>

							<div className="flex items-center gap-3 py-2.5 px-4 bg-slate-50/80 rounded-lg border border-slate-100/50">
								<div className="bg-white p-1.5 rounded-sm shadow-sm">
									<Calendar className="w-3.5 h-3.5 text-blue-500" />
								</div>
								<div className="flex flex-col">
									<span className="text-xs font-bold text-slate-700">
										{info.totalMonths} {info.totalMonths === 1 ? "Month" : "Months"}
									</span>
									<span className="text-[10px] text-slate-400 font-medium">Total Scheduled</span>
								</div>
							</div>

							{info.months.length > 0 && (
								<div className="space-y-2">
									<p className="text-[10px] font-base text-slate-500 tracking-wide pl-1">
										Active Schedule at:
									</p>
									<div className="flex flex-wrap gap-2">
										{info.months.map((month) => (
											<span
												key={month}
												className="text-[10px] px-2.5 py-1 bg-white border border-slate-200 text-red-600 rounded-sm font-medium shadow-xs"
											>
												{month}
											</span>
										))}
									</div>
								</div>
							)}
						</div>

					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default function ShiftAssignmentTable({
	users = [],
	selectedIds = [],
	onToggleSelect,
	onSelectAll,
}) {
	const selectedSet = new Set(selectedIds)
	const isAllSelected = users.length > 0 && users.every((u) => selectedSet.has(u.id))

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
						<TableHead>Schedule Status</TableHead>
						<TableHead>Default Shift</TableHead>
						<TableHead>Location</TableHead>
						<TableHead className="pr-10 text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{users.length === 0 ? (
						<TableRow>
							<TableCell colSpan={7} className="text-center py-8 text-slate-500 italic">
								No employees found.
							</TableCell>
						</TableRow>
					) : (
						users.map((user) => (
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
												<span className="font-semibold text-slate-700">{user.name}</span>

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

											<span className="text-xs text-slate-400">{user.email}</span>
										</div>
									</div>
								</TableCell>

								{/* ROLE */}
								<TableCell>
									<Badge className={roleStyles[user.role]}>{user.role}</Badge>
								</TableCell>

								{/* SCHEDULE STATUS */}
								<TableCell>
									<ScheduleStatusBadge info={user.schedulingInfo} userName={user.name} />
								</TableCell>

								{/* SHIFT */}
								<TableCell>
									<div className="flex items-center space-x-3">
										{shiftDots[user.shift?.type]}

										<div className="flex flex-col text-sm text-slate-600">
											<p className="font-semibold">{capitalize(user.shift?.type)}</p>

											<p className="text-xs text-slate-400">
												{minutesToTime(user.shift?.startTime)} -{" "}
												{minutesToTime(user.shift?.endTime)}
											</p>
										</div>
									</div>
								</TableCell>

								{/* LOCATION */}
								<TableCell>
									<Badge className="bg-blue-50 text-blue-700 border-sky-100">
										<Building2 className="mr-1" size={16} />
										{user.location?.name}
									</Badge>
								</TableCell>

								{/* ACTION */}
								<TableCell className="pr-10 text-right">
									<Link
										href={`/admin/dashboard/shift-assignments/${user.id}`}
										className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-700 rounded-lg text-sm font-medium transition-colors"
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


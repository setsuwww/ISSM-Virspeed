"use client";

import { useState, useMemo } from "react";
import { CircleUserRound, Trash2, FolderInput, RefreshCcw } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select";
import { Checkbox } from "@/_components/ui/Checkbox";
import { Button } from "@/_components/ui/Button";
import { Input } from "@/_components/ui/Input";
import { capitalize } from "@/_function/globalFunction";
import { roleStyles } from "@/_constants/roleConstants";
import { format } from "date-fns";

import { EmployeesSwitchModal } from "../../../users/(manage)/employees/EmployeesSwitchModal";
import EmptyStates from "@/_components/common/EmptyStates";

export default function UserShiftTable({ data }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredData.length) { setSelectedIds([])} 
    else { setSelectedIds(filteredData.map((u) => u.id));}
  };

  const filteredData = useMemo(() => {
    return data.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = filterRole === "ALL" ? true : u.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [data, search, filterRole]);

  const handleDeleteSelected = () => {
    setSelectedIds([]);
  };

  const handleDeleteAll = () => console.log("Delete all");

  const handleSwapShift = (userId) => {
    setCurrentUserId(userId);
    setModalOpen(true);
  };

  const handleEditUser = (userId) => console.log("Edit user:", userId);
  const handleDeleteUser = (userId) => console.log("Delete user:", userId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger>
              <span className="text-slate-700 font-semibold">Role :</span>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="COORDINATOR">Manager</SelectItem>
              <SelectItem value="EMPLOYEE">Staff</SelectItem>
              <SelectItem value="USER">User</SelectItem>
            </SelectContent>
          </Select>

          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-rose-500" 
            disabled={selectedIds.length === 0} onClick={handleDeleteSelected}
          >
            Delete Selected
          </Button>
          <Button size="sm" variant="ghost" className="bg-rose-50/70 text-rose-500 hover:bg-rose-100"
            onClick={handleDeleteAll}
          >
            <Trash2 size={18} strokeWidth={2} />
            Delete All
          </Button>
          <Button size="sm" variant="ghost" onClick={() => console.log("Export CSV")}
            className="bg-teal-100/50 text-teal-600 hover:bg-teal-100"
          >
            <FolderInput size={16} /> Export
          </Button>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <EmptyStates />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox checked={selectedIds.length > 0 && selectedIds.length === filteredData.length} onCheckedChange={toggleSelectAll}/>
              </TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created & Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.map((user) => {
              const created = format(new Date(user.createdAt), "dd MMMM yyyy");
              const updated = format(new Date(user.updatedAt), "dd MMMM yyyy");

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox checked={selectedIds.includes(user.id)}
                      onCheckedChange={() => setSelectedIds(selectedIds.includes(user.id)
                        ? selectedIds.filter((id) => id !== user.id)
                          : [...selectedIds, user.id]
                      )}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-x-2">
                      <div className="p-2 bg-slate-200 rounded-full">
                        <CircleUserRound strokeWidth={1.5} className="text-slate-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-600">{user.name}</span>
                        <span className="text-xs text-slate-400">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className={`bg-transparent text-base ${roleStyles[capitalize(user.role)] ?? ""}`}>
                      {capitalize(user.role)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-600">{created}</span>
                      <span className="text-xs text-slate-400">{updated}</span>
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleSwapShift(user.id)}>
                        <RefreshCcw />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditUser(user.id)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <EmployeesSwitchModal
        open={modalOpen}
        onOpenChange={(isOpen) => {
          setModalOpen(isOpen);
          if (!isOpen) setCurrentUserId(null);
        }}
        currentUserId={currentUserId}
      />
    </div>
  );
}

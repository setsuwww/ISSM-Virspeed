"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table";
import { Checkbox } from "@/_components/ui/Checkbox";
import { UsersActionHeader } from "./UsersActionHeader";
import { UsersRow } from "./UsersRow";
import { roleStyles } from "@/_constants/roleConstants";
import { useUsersHooks } from "@/_client/hooks/useUsersHooks";
import EmptyStates from "@/_components/common/EmptyStates";

export default function UsersTable({ data }) {
  const {
    search, handleSearchChange,
    roleFilter, handleRoleFilterChange, shiftFilter, handleShiftFilterChange,
    filteredData, selectedIds, selectedIdsSet, isAllSelected,
    toggleSelect, selectAll, deleteSelected, deleteAll,
    handleEditUser, handleDeleteUser, onExportPDF
  } = useUsersHooks(data);

  return (
    <div className="rounded-md space-y-4">
      <UsersActionHeader
        search={search} onSearchChange={handleSearchChange}
        roleFilter={roleFilter} onRoleFilterChange={handleRoleFilterChange}
        shiftFilter={shiftFilter} onShiftFilterChange={handleShiftFilterChange}
        selectedCount={selectedIds.length} onDeleteSelected={deleteSelected} onDeleteAll={deleteAll}
        onExportPDF={() => onExportPDF(filteredData)}
        filteredData={filteredData}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="flex items-center">
              <Checkbox checked={isAllSelected} onCheckedChange={selectAll} />
            </TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Work Hours</TableHead>
            <TableHead>Created & Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="w-10 text-center text-slate-400"><EmptyStates /></TableCell>
            </TableRow>
          ) : (
            filteredData.map((user) => (
              <UsersRow key={user.id} user={user}
                isSelected={selectedIdsSet.has(user.id)}
                onToggleSelect={toggleSelect}
                onEdit={handleEditUser} onDelete={handleDeleteUser}
                roleStyles={roleStyles}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

import { useState } from "react";
import EmptyStates from "@/_components/common/EmptyStates";
import { Table, TableBody, TableHead, TableHeader, TableCell, TableRow } from "@/_components/ui/Table";
import { Checkbox } from "@/_components/ui/Checkbox";

import { EmployeesActionHeader } from "../EmployeesActionHeader";
import { EmployeesRow } from "./EmployeesRow";

import { useHandleUsers } from "@/_clients/handlers/admin/useHandleUsers";
import { useNormalEmployeesHooks } from "@/_clients/hooks/admin/useNormalEmployeesHooks";

export default function EmployeesTable({ users = [], divisions = [] }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const {
    search, setSearch,
    filteredData,
    divisionFilter, setDivisionFilter
  } = useNormalEmployeesHooks(users);

  const {
    toggleSelect, selectAll,
    deleteSelected, deleteAll,
    handleDeleteUser,
    handleEditUser
  } = useHandleUsers({ filteredData, selectedIds, setSelectedIds});

  return (
    <div className="space-y-4">
      <EmployeesActionHeader mode="work-hours"
        search={search} setSearch={setSearch}
        selected={selectedIds} onDeleteSelected={deleteSelected} onDeleteAll={deleteAll}
        filteredData={filteredData}
        divisionFilter={divisionFilter} setDivisionFilter={setDivisionFilter}
        divisions={divisions}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="flex items-center">
              <Checkbox
                checked={
                  filteredData.length > 0 &&
                  selectedIds.length === filteredData.length
                }
                onCheckedChange={(value) =>
                  selectAll(!!value)
                }
              />
            </TableHead>
            <TableHead>Employees</TableHead>
            <TableHead>Work Hours</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Created & Updated</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center">
                <EmptyStates />
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((user) => (
              <EmployeesRow
                key={user.id}
                user={user}
                selected={selectedIds}
                toggleSelect={toggleSelect}
                onEdit={() => handleEditUser(user.id)}
                onDelete={() => handleDeleteUser(user.id)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

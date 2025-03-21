"use client";
import * as React from "react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableColumnHeader } from "./datatable/DataTableColumnHeader";
import { Checkbox } from "../ui/checkbox";
import { StaticTasksTableFloatingBar } from "./components/StaticTasksTableFloatingBar";
import { TableViewOptions } from "./datatable/DataTableViewOptions";
import { ExportButton } from "../ui/ExportButton";
import { Check, XCircle, EditIcon, TrashIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { DataTableFacetedFilter } from "./datatable/DataTableFacetedFilter";
import { DataTablePagination } from "./datatable/DataTablePagination";
import { EmptyState } from "./components/ReusableEmptyState";
import { AddRole } from "./CRUD/AddRole";
import { Id } from "../../../convex/_generated/dataModel";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { EditUser } from "../Usersmanagment/CRUD/EditUser";
import { getCommonPinningStyles } from "@/lib/data-table";

export function UsersTable() {
  const usersQuery = useQuery(api.mutations.user.fetchAllUsers);
  const departmentsQuery = useQuery(api.mutations.departments.getAllDepartments);
  const isLoading = usersQuery === undefined || departmentsQuery === undefined;
  const users = usersQuery ?? [];
  const departments = departmentsQuery ?? [];

  // State for sorting, filtering, visibility, and selected rows
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = React.useState<Set<string>>(new Set());
  const [searchEmail, setSearchEmail] = React.useState("");

  // Filter users based on email search
  const filteredUsers = React.useMemo(() => {
    return users.filter((user:any) =>
      user.email.toLowerCase().includes(searchEmail.toLowerCase())
    );
  }, [users, searchEmail]);

  // Reset filters
  const resetFilters = () => {
    setSearchEmail("");
    setSelectedStatus(new Set());
  };

  // Dynamically generate unique statuses for filtering
  const uniqueStatuses:any = React.useMemo(() => {
    const allStatuses = users.map((user) => user.status);
    return Array.from(new Set(allStatuses)).map((status) => ({
      value: status,
      label: status,
    }));
  }, [users]);

  // Columns definition
  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            const isChecked = value === true;
            if (isChecked) {
              const newSelectedRows = new Set(users.map((user) => user._id));
              setSelectedRows(newSelectedRows);
              table.getRowModel().rows.forEach((row) => row.toggleSelected(true));
            } else {
              setSelectedRows(new Set());
              table.getRowModel().rows.forEach((row) => row.toggleSelected(false));
            }
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRows.has(row.original._id)}
          onCheckedChange={(value) => {
            const isChecked = value === true;
            const updatedSelectedRows = new Set(selectedRows);
            if (isChecked) {
              updatedSelectedRows.add(row.original._id);
            } else {
              updatedSelectedRows.delete(row.original._id);
            }
            setSelectedRows(updatedSelectedRows);
            row.toggleSelected(isChecked);
          }}
          aria-label={`Select ${row.original.name}`}
        />
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <span className="font-bold">{row.original.name || "N/A"}</span>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => <span className="font-bold">{row.original.email || "N/A"}</span>,
    },
    {
      accessorKey: "role",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) => row.original.role?.name || "N/A",
    },
    {
      accessorKey: "department",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
      cell: ({ row }) => row.original.department?.name || "N/A",
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {["invited", "Accepted"].includes(row.original.status) ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span>{row.original.status}</span>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <EditUser user={row.original} />
        </div>
      ),
    },
  ];

  // Initialize table
  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return <Spinner size="sm" />;
  }

  return (
    <div>
      {/* Floating bar */}
      {selectedRows.size > 0 && (
        <StaticTasksTableFloatingBar
          table={table}
          setSelectedRows={setSelectedRows}
        />
      )}

      {/* Filters and Actions */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-4 flex-grow">
          {/* Email Search */}
          <Input
            placeholder="Search by email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="w-full max-w-sm"
          />
          {/* Status Filter */}
          <DataTableFacetedFilter
            title="Status"
            options={uniqueStatuses}
            selectedValues={selectedStatus}
            renderOption={(option) => (
              <div className="flex items-center space-x-2">
                <span>{option.label}</span>
              </div>
            )}
            onChange={setSelectedStatus}
          />
          {/* Reset Filters Button */}
          {(searchEmail || selectedStatus.size > 0) && (
            <Button
              aria-label="Reset filters"
              variant="ghost"
              className="h-8 px-2 lg:px-3"
              onClick={resetFilters}
            >
              Reset
              <XCircle className="ml-2 size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* Export and View Buttons */}
          <ExportButton
            table={table}
            filename="users"
            excludeColumns={["select", "actions"]}
          />
          <TableViewOptions
            columns={table
              .getAllColumns()
              .filter((column) => column.id !== "select" && column.id !== "actions")
              .map((column) => ({
                id: column.id,
                isVisible: column.getIsVisible(),
                toggleVisibility: () => column.toggleVisibility(!column.getIsVisible()),
                canHide: column.getCanHide(),
              }))}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
  <TableHead key={header.id} className="w-auto whitespace-nowrap overflow-hidden text-ellipsis" style={{
                                        ...getCommonPinningStyles({ column: header.column }),
                                    }}>                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2 w-auto whitespace-nowrap overflow-hidden text-ellipsis">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                <div
                                        className="flex justify-center items-center text-center "
                                    >                    <EmptyState
                      title="No Users Found"
                      description="There are no users matching the current filters."
                      imageSrc="/users-empty.png"
                      actionComponent={<AddRole />}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
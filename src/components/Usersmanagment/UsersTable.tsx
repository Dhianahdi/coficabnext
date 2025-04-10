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
import { Check, XCircle, EditIcon, TrashIcon, Loader2 } from "lucide-react";
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
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { EditUser } from "../Usersmanagment/CRUD/EditUser";
import { getCommonPinningStyles } from "@/lib/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export function UsersTable() {
  const usersQuery = useQuery(api.mutations.user.fetchAllUsers);
  const departmentsQuery = useQuery(api.mutations.departments.getAllDepartments);
  const isLoading = usersQuery === undefined || departmentsQuery === undefined;
  const users = usersQuery ?? [];
  const departments = departmentsQuery ?? [];
  const inviteUserMutation = useMutation(api.mutations.user.inviteUser);

  // State for sorting, filtering, visibility, and selected rows
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [selectedStatus, setSelectedStatus] = React.useState<Set<string>>(new Set());
  const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState<Id<"departments"> | "">("");
  const [searchEmail, setSearchEmail] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
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


  const handleInviteUser = async () => {
    if (!email || !departmentId) {
      toast.error("Please enter a valid email and select a department.");
      return;
    }

    try {
        setIsSending(true); // Activer l'état de chargement
        const result = await inviteUserMutation({ email, departmentId });
      toast.success(result.message);

      // Envoyer l'email d'invitation via l'API Next.js
      const invitationLink = `http://localhost:3000/invite?email=${encodeURIComponent(email)}`;
      const template = `
      <div style="
        font-family: Arial, sans-serif;
        color: #000;
        background-color: #ffffff;
        padding: 40px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 600px;
        margin: 0 auto;
      ">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="
            font-size: 28px;
            font-weight: bold;
            color: #111827;
            margin: 0;
          ">
            🎉 You've Been Invited!
          </h1>
          <p style="
            font-size: 16px;
            color: #6b7280;
            margin-top: 10px;
          ">
            Welcome to our platform! Let's get started.
          </p>
        </div>
    
        <!-- Content -->
        <div style="
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        ">
          <p style="
            font-size: 16px;
            color: #374151;
            margin: 0;
          ">
            Click the button below to complete your registration:
          </p>
          <a href="${invitationLink}" style="
            display: inline-block;
            background-color: #3b82f6;
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            margin-top: 20px;
          ">
            Complete Registration
          </a>
        </div>
    
        <!-- Footer -->
        <div style="
          text-align: center;
          margin-top: 30px;
          font-size: 14px;
          color: #6b7280;
        ">
          <p style="margin: 0;">
            If you did not request this invitation, please ignore this email.
          </p>
          <p style="margin: 10px 0 0;">
            Need help? <a href="mailto:support@example.com" style="color: #3b82f6; text-decoration: none;">Contact support</a>.
          </p>
        </div>
      </div>
    `;

      const response = await fetch("/api/costummail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          subject: "Invitation to Join Our Platform",
          template,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send invitation email.");
      }

      toast.success("Invitation email sent successfully!");
      setIsInviteDialogOpen(false);
      setEmail("");
      setDepartmentId("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
        setIsSending(false); // Désactiver l'état de chargement
      }
  };





  if (isLoading) {
    return <Spinner size="sm" />;
  }

  return (
    
    <div>
       {/* Invite User Dialog */}
<Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
  <DialogContent className="bg-white">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold text-gray-900">Invite User</DialogTitle>
      <DialogDescription className="text-gray-600">
        Enter the user's email and select their department.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
        <Input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          type="email"
          className="rounded-lg border border-gray-300 focus:border-black focus:ring-black"
        />
      </div>
      <div>
        <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department</Label>
        <div className="grid grid-cols-2 gap-4">
          {departments.map((department: any) => (
            <Card
              key={department._id}
              onClick={() => setDepartmentId(department._id)}
              className={`cursor-pointer ${
                departmentId === department._id
                  ? "border-2 border-black"
                  : "border border-gray-300"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-lg">{department.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setIsInviteDialogOpen(false)}
        className="rounded-lg border border-gray-300 hover:bg-gray-100"
      >
        Cancel
      </Button>
      <Button
        onClick={handleInviteUser}
        disabled={isSending} // Désactiver le bouton pendant l'envoi
        className="bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
      >
        {isSending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {/* Afficher un spinner */}
            Sending...
          </>
        ) : (
          "Send Invitation"
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
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
          <Button onClick={() => setIsInviteDialogOpen(true)} className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90">
                      Invite User
                  </Button>
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
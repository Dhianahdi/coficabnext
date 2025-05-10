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
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>COFICAB - Invitation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f7f7; color: #333333;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
          <!-- En-tête -->
          <tr>
            <td align="center" style="padding: 30px 0; background: linear-gradient(135deg, #000000, #333333); border-top-left-radius: 12px; border-top-right-radius: 12px;">
              <img src="https://coficab.com/wp-content/uploads/2023/01/logo-coficab-white.png" alt="COFICAB" width="180" style="display: block; margin: 0 auto;">
            </td>
          </tr>
          
          <!-- Contenu principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: 600; color: #000000; text-align: center;">You've Been Invited!</h1>
              
              <p style="margin: 0 0 15px; font-size: 16px; line-height: 1.5; color: #4B5563;">Hello,</p>
              
              <p style="margin: 0 0 25px; font-size: 16px; line-height: 1.5; color: #4B5563;">You have been invited to join the COFICAB platform. To complete your registration and set up your account, please click the button below:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationLink}" style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 16px; font-weight: 500; text-decoration: none; padding: 14px 28px; border-radius: 8px; transition: background-color 0.3s ease;">
                  Complete Registration
                </a>
              </div>
              
              <p style="margin: 30px 0 0; font-size: 16px; line-height: 1.5; color: #4B5563;">This invitation link will expire in 48 hours. If you did not expect this invitation, please disregard this email.</p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #4B5563;">Best regards,<br>The COFICAB Team</p>
              </div>
            </td>
          </tr>
          
          <!-- Pied de page -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8f9fa; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #6B7280;">© 2023 COFICAB. All rights reserved.</p>
              <p style="margin: 0; font-size: 13px; color: #9CA3AF;">Need help? <a href="mailto:support@coficab.com" style="color: #000000; text-decoration: underline;">Contact our support team</a>.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
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
    <div className="space-y-6">
      {/* Page Title and Description */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage your platform users, invite new members, and assign departments.
        </p>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <h3 className="text-2xl font-bold">{users.length}</h3>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-primary"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <h3 className="text-2xl font-bold">
                {users.filter(user => user.status === "Accepted").length}
              </h3>
            </div>
            <div className="rounded-full bg-green-500/10 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-green-500"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Invitations</p>
              <h3 className="text-2xl font-bold">
                {users.filter(user => user.status === "invited").length}
              </h3>
            </div>
            <div className="rounded-full bg-yellow-500/10 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-yellow-500"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Invite User</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Enter the user's email and select their department.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                type="email"
                className="rounded-lg border border-gray-300 focus:border-black focus:ring-black dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-gray-500 dark:focus:ring-gray-500"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="department" className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</Label>
              <div className="grid grid-cols-2 gap-4 max-h-[200px] overflow-y-auto pr-1">
                {departments.map((department: any) => (
                  <Card
                    key={department._id}
                    onClick={() => setDepartmentId(department._id)}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md dark:hover:shadow-gray-800 ${
                      departmentId === department._id
                        ? "border-2 border-black bg-gray-50 dark:border-gray-400 dark:bg-gray-800"
                        : "border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                    }`}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg dark:text-white">{department.name}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
              className="rounded-lg border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteUser}
              disabled={isSending}
              className="bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
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

      {/* Card containing table and filters */}
      <div className="rounded-lg border bg-card shadow-sm">
        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto mb-4 sm:mb-0">
            {/* Invite Button */}
            <Button 
              onClick={() => setIsInviteDialogOpen(true)} 
              className="flex items-center bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 mr-2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              Invite User
            </Button>
            
            {/* Email Search */}
            <div className="relative w-full sm:w-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              <Input
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="pl-10 w-full sm:w-[250px] rounded-lg border-gray-300 focus:border-black focus:ring-black"
              />
            </div>
            
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
                className="h-9 px-3 rounded-lg"
                onClick={resetFilters}
              >
                Reset
                <XCircle className="ml-2 size-4" aria-hidden="true" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
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
        <div className="overflow-x-auto">
          <Table>
          <TableHeader className="dark:bg-gray-900">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="dark:border-gray-800">
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="dark:text-gray-300">
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow 
                    key={row.id} 
                    className="dark:border-gray-800 dark:hover:bg-gray-900"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id} 
                        className="py-3 px-4 whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-[300px] text-center">
                    <div className="flex justify-center items-center text-center">
                      <EmptyState
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
        <div className="flex justify-between items-center p-4 border-t">
          <DataTablePagination table={table} />
        </div>
      </div>
    </div>
  );
}
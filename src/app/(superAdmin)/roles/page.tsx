"use client";

import { useEffect, useState } from "react";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { RolesTable } from "@/components/RoleManagement/RolesTable";
import { AddRole } from "@/components/RoleManagement/CRUD/AddRole";
import { AddPermission } from "@/components/PermissionsManagement/CRUD/AddPermission";
import { PermissionsTable } from "@/components/PermissionsManagement/PermissionsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { UsersTable } from "@/components/Usersmanagment/UsersTable";
import { Pagination } from "@/components/ui/pagination"; // Assurez-vous d'avoir un composant Pagination

export default function Test() {
  // Fetch raw roles and permissions data
  const rawRoles = useQuery(api.queries.roles.getRoles);
  const rawPermissions = useQuery(api.queries.permissions.fetchAllPermissions);

  // Pagination state
  const [rolesPage, setRolesPage] = useState(1);
  const [permissionsPage, setPermissionsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const itemsPerPage = 5; // Nombre d'éléments par page

  // Transform _creationTime into createdAt for roles
  const roles =
    rawRoles?.map((role) => {
      const createdAt = new Date(role._creationTime).toISOString();
      return {
        ...role,
        createdAt,
      };
    }) || [];

  // Transform _creationTime into createdAt for permissions
  const permissions =
    rawPermissions?.map((permission) => {
      const createdAt = new Date(permission._creationTime).toISOString();
      return {
        ...permission,
        createdAt,
        assignedRoles: permission.assignedRoles || [], // Ensure assignedRoles is included
      };
    }) || [];

  // Loading state
  const isLoading = !rawRoles || !rawPermissions;

  // Pagination logic
  const paginate = (array: any[], page: number, itemsPerPage: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    return array.slice(startIndex, startIndex + itemsPerPage);
  };

  const paginatedRoles = paginate(roles, rolesPage, itemsPerPage);
  const paginatedPermissions = paginate(permissions, permissionsPage, itemsPerPage);

  // Log roles and permissions to the console once they're fetched/updated
  useEffect(() => {
    console.log("Roles:", roles);
    console.log("Permissions:", permissions);
  }, [roles, permissions]);

  return (
    <AdminPanelLayout>
      <ContentLayout title="Dashboard">
        {/* Users Section */}
        <div className="mt-6">
          <h1 className="text-2xl font-semibold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Manage user accounts, roles, and permissions.
          </p>
          <UsersTable />
       
        </div>

        {/* Roles Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-foreground">Role Management</h1>
            <AddRole />
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Manage and oversee user roles within the system. Roles define access
            levels and permissions for different users.
          </p>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <>
              <RolesTable roles={paginatedRoles} />
              
            </>
          )}
        </div>

        {/* Permissions Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-foreground">Permission Management</h1>
            <AddPermission />
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Define and manage permissions that can be assigned to roles.
            Permissions control access to specific features and resources.
          </p>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <>
              <PermissionsTable permissions={paginatedPermissions} />
             
            </>
          )}
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Spinner size="sm" className="bg-black dark:bg-white" />
          </div>
        )}
      </ContentLayout>
    </AdminPanelLayout>
  );
}
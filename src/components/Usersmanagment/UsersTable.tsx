"use client";

import { useQuery } from "convex/react";
import { Spinner } from "@/components/ui/spinner";
import { api } from "../../../convex/_generated/api";

const UsersTable = () => {
  const usersQuery = useQuery(api.mutations.user.fetchAllUsers);
  const users = usersQuery;  // Utilisez `data` pour accéder aux utilisateurs
  const isLoading = !usersQuery;  // Vérification si les données sont en train de charger

  if (isLoading) {
    return <Spinner size="sm" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Department</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user:any) => (
            <tr key={user._id}>
              <td className="px-4 py-2">{user.name || "N/A"}</td>
              <td className="px-4 py-2">
                {user.roleId ? user.roleId : "N/A"}
              </td>
              <td className="px-4 py-2">
                {user.departmentId ? user.departmentId : "N/A"}
              </td>
              <td className="px-4 py-2">
                {/* Ajoutez ici vos actions de modification */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;

"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function EditUser({ user }: { user: any }) {
  // Charger les rôles et départements depuis la base de données
  const roles = useQuery(api.mutations.roles.getAllRoles) || [];
  const departments = useQuery(api.mutations.department.getAllDepartments) || [];

  // États pour la sélection des rôles et départements
  const [roleId, setRoleId] = useState(user.role?._id || "");
  const [departmentId, setDepartmentId] = useState(user.department?._id || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateUser = useMutation(api.mutations.user.updateUser);

  const handleSubmit = async () => {
    if (!roleId || !departmentId) {
      toast.error("Both role and department must be selected.");
      return;
    }

    try {
      setIsSaving(true);
      await updateUser({
        userId: user._id,
        roleId,
        departmentId,
      });
      toast.success("User updated successfully!");
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <Edit size={16} strokeWidth={2} aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[80vh] sm:max-w-5xl [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            Edit User
          </DialogTitle>
          <DialogDescription asChild>
            <div className="px-6 py-4">Modify the fields below to update the user.</div>
          </DialogDescription>
        </DialogHeader>

        {/* Form Fields */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: "60vh" }}>
          {/* Role Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            <Label htmlFor="role" className="sm:col-span-1 text-sm font-bold">
              Role
            </Label>
            <select
              id="role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="sm:col-span-3 border border-border rounded-lg p-2"
            >
              <option value="" disabled>Select a role</option>
              {roles.map((role: any) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center mt-4">
            <Label htmlFor="department" className="sm:col-span-1 text-sm font-bold">
              Department
            </Label>
            <select
              id="department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="sm:col-span-3 border border-border rounded-lg p-2"
            >
              <option value="" disabled>Select a department</option>
              {departments.map((dept: any) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4 sm:items-center">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="animate-spin mr-2 h-4 w-4" aria-hidden="true" />}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

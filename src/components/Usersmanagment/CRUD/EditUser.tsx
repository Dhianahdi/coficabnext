"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { Loader2, PencilIcon } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function EditUser({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [departmentId, setDepartmentId] = useState(user.department?._id || "");
  const [roleId, setRoleId] = useState(user.role?._id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departmentsQuery = useQuery(api.mutations.departments.getAllDepartments);
  const rolesQuery = useQuery(api.mutations.roles.getAllRoles);
  const updateUserMutation = useMutation(api.mutations.user.updateUser);

  const departments = departmentsQuery || [];
  const roles = rolesQuery || [];

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Please enter a name");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateUserMutation({
        userId: user._id,
        name,
        departmentId,
        roleId,
      });
      toast.success("User updated successfully");
      setIsOpen(false);
    } catch (error: any) {
      toast.error(`Failed to update user: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 dark:hover:bg-gray-800">
          <PencilIcon className="h-4 w-4 dark:text-gray-300" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold dark:text-white">Edit User</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Update user information and permissions
          </DialogDescription>
        </DialogHeader>

        {/* User Profile Card */}
        <div className="mb-6 mt-2">
          <Card className="border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="p-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-2 border-white shadow-sm dark:border-gray-700">
                  <AvatarImage src={user.imageUrl} alt={user.name} />
                  <AvatarFallback className="bg-black text-white text-lg dark:bg-gray-700">
                    {user.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-xl dark:text-white">{user.name || "Unnamed User"}</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  <div className="flex items-center mt-1">
                    <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                      user.status === "Accepted" ? "bg-green-500" : "bg-yellow-500"
                    }`}></span>
                    <span className="text-xs font-medium dark:text-gray-300">{user.status}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium dark:text-gray-300">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter user name"
              className="border-gray-300 focus:border-black focus:ring-black dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-gray-500 dark:focus:ring-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium dark:text-gray-300">
              Department
            </Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                {departments.map((department: any) => (
                  <SelectItem key={department._id} value={department._id} className="dark:text-white dark:focus:bg-gray-700">
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium dark:text-gray-300">
              Role
            </Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                {roles.map((role: any) => (
                  <SelectItem key={role._id} value={role._id} className="dark:text-white dark:focus:bg-gray-700">
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-black text-white hover:bg-gray-800 flex items-center gap-2 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

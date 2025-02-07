"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EditUser({ user }: { user: any }) {
  const [roleId, setRoleId] = useState(user.roleId || "");
  const [departmentId, setDepartmentId] = useState(user.departmentId || "");
  const updateUser = useMutation(api.mutations.user.updateUser);

  const handleSubmit = async () => {
    await updateUser({
      userId: user._id, // ID de l'utilisateur
      roleId,           // Mise à jour du rôle
      departmentId,     // Mise à jour du département
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        
        {/* Affichage et mise à jour du rôle */}
        <div className="mb-4">
          <Input
            placeholder="Role"
            value={roleId || "N/A"}
            onChange={(e) => setRoleId(e.target.value || "N/A")}
          />
        </div>
        
        {/* Affichage et mise à jour du département */}
        <div className="mb-4">
          <Input
            placeholder="Department"
            value={departmentId || "N/A"}
            onChange={(e) => setDepartmentId(e.target.value || "N/A")}
          />
        </div>

        {/* Bouton pour soumettre les changements */}
        <Button onClick={handleSubmit}>Save Changes</Button>
      </DialogContent>
    </Dialog>
  );
}

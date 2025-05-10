"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function AddDepartment() {
  const createDepartment = useMutation(api.mutations.departments.createDepartment);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [headId, setHeadId] = useState("" as Id<"users"> | "");
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setHeadId("");
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    try {
      setIsSaving(true);
      await createDepartment({
        name: name.trim(),
        description: description.trim(),
        headId: headId ? headId : undefined, // Only pass if valid
      });
      toast.success("Department created successfully!");
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create department. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} variant="outline">
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          <span>Add Department</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[80vh] sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="border-b px-6 py-4 text-base">Create Department</DialogTitle>
          <DialogDescription>
            <div className="px-6 py-4">
              Fill in the details below to create a new department.
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: "60vh" }}>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter department name" />

          <Label htmlFor="description">Description</Label>
          <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter department description" />

          <Label htmlFor="headId">Head ID</Label>
          <Input id="headId" value={headId} onChange={(e) => setHeadId(e.target.value as Id<"users">)} placeholder="Enter department head ID" />
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="animate-spin mr-2 h-4 w-4" aria-hidden="true" />}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

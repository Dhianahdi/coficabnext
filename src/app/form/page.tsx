"use client";

import * as React from "react";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Edit, Search, Plus, Eye, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { DataTableFacetedFilter } from "@/components/JobManagement/datatable/DataTableFacetedFilter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function FormsPage() {
  const router = useRouter();
  const forms = useQuery(api.mutations.form.getFormsWithQuestions);
  const deleteForm = useMutation(api.mutations.form.deleteForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Set<string>>(new Set());
  const [selectedForm, setSelectedForm] = useState<any>(null); // Selected form for dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Delete confirmation dialog
  const [formToDelete, setFormToDelete] = useState<Id<"forms"> | null>(null); // Form ID to delete
  const [isDeleting, setIsDeleting] = useState(false); // Delete loading state

  // Filter forms
  const filteredForms = forms?.filter((form: any) => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus.size === 0 || selectedStatus.has(form.status || "");
    return matchesSearch && matchesStatus;
  });

  // Open delete confirmation dialog
  const openDeleteDialog = (formId: Id<"forms">, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormToDelete(formId);
    setIsDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setFormToDelete(null);
  };

  // Delete a form
  const handleDeleteForm = async () => {
    if (!formToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteForm({ formId: formToDelete });
      toast.success("Form deleted successfully!");
      closeDeleteDialog();
    } catch (error) {
      toast.error("Failed to delete form.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open form details in a dialog
  const handleViewForm = (form: any) => {
    setSelectedForm(form);
    setIsDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedForm(null);
  };

  // Redirect to update form page
  const handleUpdateForm = (formId: Id<"forms">) => {
    router.push(`/form/update/${formId}`);
  };

  // Status filter options
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ];
  
  if (forms?.length === 0) {
    // No open jobs found
    return (
      <AdminPanelLayout>
        <ContentLayout title="Recent Jobs">
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
             <Image
               src="/img/NoResultFound.png"
               alt="No offers available"
               width={700}
               height={700}
               className="object-cover"
             />
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  No forms available at the moment
                </h3>
                <p className="text-gray-600">
                  Check back later to discover new opportunities.
                </p>
              </div>
            </div>
        </ContentLayout>
      </AdminPanelLayout>
    );
  }
  
  return (
    <AdminPanelLayout>
      <ContentLayout title="Form Management">
        <div className="p-8 space-y-8">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Forms Management</h1>
              <p className="text-muted-foreground mt-1">Create and manage your forms for assessments and surveys</p>
            </div>
            <Button 
              onClick={() => router.push("/form/add")} 
              className="bg-primary hover:bg-primary/90 shadow-sm"
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          </div>
          
          <div className="bg-background rounded-lg shadow-sm border border-border p-4 dark:bg-muted/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search forms by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 max-w-md"
              />
            </div>
          </div>

          {/* Form list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms?.map((form: any) => (
              <Card key={form._id} className="overflow-hidden border border-muted/60 hover:shadow-md transition-all duration-200">
                <div className="bg-primary/5 h-2"></div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl line-clamp-1">{form.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">{form.description}</CardDescription>
                    </div>
                    <Badge className="ml-2" variant={form.status === "draft" ? "secondary" : "default"}>
                      {form.status || "Public"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-2 font-medium">
                      {form.questions.length}
                    </span>
                    {form.questions.length === 1 ? 'question' : 'questions'}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 bg-muted/10 border-t pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewForm(form)}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUpdateForm(form._id)}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => openDeleteDialog(form._id, e)}
                    className="hover:bg-red-100 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Dialog to view form details */}
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl">{selectedForm?.title}</DialogTitle>
              <DialogDescription className="mt-2">{selectedForm?.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex items-center">
                <h3 className="font-semibold text-lg">Questions</h3>
                <Badge className="ml-2" variant="outline">
                  {selectedForm?.questions.length} {selectedForm?.questions.length === 1 ? 'question' : 'questions'}
                </Badge>
              </div>
              {selectedForm?.questions.map((question: any, index: number) => (
                <Card key={index} className="p-4 border border-muted/60">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center font-medium text-sm">
                      {index + 1}
                    </div>
                    <Badge variant="outline">
                      {question.type === "single-choice" 
                        ? "Single Choice" 
                        : question.type === "multiple-choice" 
                          ? "Multiple Choice" 
                          : "Open-Ended"}
                    </Badge>
                  </div>
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-base">{question.text}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 mt-2">
                    {question.type === "single-choice" || question.type === "multiple-choice" ? (
                      <ul className="space-y-1 pl-6">
                        {question.options?.map((option: string, optionIndex: number) => (
                          <li key={optionIndex} className="text-sm">
                            {option}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="bg-muted/30 p-3 rounded-md text-sm text-muted-foreground italic">
                        Free text response
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this form? This action cannot be undone and all associated data will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" onClick={closeDeleteDialog}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteForm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Form"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ContentLayout>
    </AdminPanelLayout>
  );
}
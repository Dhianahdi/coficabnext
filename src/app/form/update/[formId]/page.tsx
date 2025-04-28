"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

type QuestionType = "single-choice" | "multiple-choice" | "open-ended";

type Question = {
  _id: Id<"questions">;
  text: string;
  type: QuestionType;
  options?: string[];
  answer?: string | string[];
};

export default function UpdateFormPage({ params }: { params: { formId: string } }) {
  const router = useRouter();
  const form = useQuery(api.mutations.form.getFormWithQuestions, { formId: params.formId as Id<"forms"> });
  const updateForm = useMutation(api.mutations.form.updateForm);
  const updateQuestion = useMutation(api.mutations.form.updateQuestion);
  const deleteQuestion = useMutation(api.mutations.form.deleteQuestion);
  const addQuestion = useMutation(api.mutations.form.addQuestion);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Mettre à jour le titre et la description lorsque le formulaire est chargé
  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description);
      setQuestions(form.questions);
    }
  }, [form]);

  // Update the form
  const handleUpdateForm = async () => {
    if (!form) return;

    setIsSaving(true);
    try {
      // Update the form
      await updateForm({
        formId: form._id,
        title,
        description,
      });

      // Update the questions
      for (const question of questions) {
        await updateQuestion({
          questionId: question._id,
          text: question.text,
          type: question.type,
          options: question.options,
        });
      }

      toast.success("Form updated successfully!");
    } catch (error) {
      toast.error("Failed to update the form.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new question
  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      _id: "" as Id<"questions">, // Temporary ID
      text: "New question",
      type,
      options: type !== "open-ended" ? [] : undefined,
      answer: type === "open-ended" ? "" : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  // Update a question
  const handleUpdateQuestion = (questionId: Id<"questions">, field: keyof Question, value: string | string[]) => {
    const updatedQuestions = questions.map((question) =>
      question._id === questionId ? { ...question, [field]: value } : question
    );
    setQuestions(updatedQuestions);
  };

  // Add an option to a question
  const handleAddOption = (questionId: Id<"questions">, option: string) => {
    const updatedQuestions = questions.map((question) =>
      question._id === questionId
        ? { ...question, options: [...(question.options || []), option] }
        : question
    );
    setQuestions(updatedQuestions);
  };

  // Delete an option from a question
  const handleDeleteOption = (questionId: Id<"questions">, optionIndex: number) => {
    const updatedQuestions = questions.map((question) =>
      question._id === questionId
        ? { ...question, options: question.options?.filter((_, index) => index !== optionIndex) }
        : question
    );
    setQuestions(updatedQuestions);
  };

  // Delete a question
  const handleDeleteQuestion = async (questionId: Id<"questions">) => {
    try {
      await deleteQuestion({ questionId });
      setQuestions(questions.filter((question) => question._id !== questionId));
      toast.success("Question deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete the question.");
    }
  };

  if (!form) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AdminPanelLayout>
      <ContentLayout title="Update Form">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Update Form
          </h1>
          
          {/* Main form */}
          <Card className="shadow-md border border-muted/60">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Save className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Form Details</CardTitle>
                  <CardDescription>Update the basic information about your form</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="space-y-3">
                <Label htmlFor="form-title" className="text-base font-medium">Form Title</Label>
                <Input
                  id="form-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title for your form"
                  className="max-w-3xl text-base py-6 px-4 border-muted-foreground/20 focus-visible:ring-primary/50"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="form-description" className="text-base font-medium">Form Description</Label>
                <Textarea
                  id="form-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about the purpose of this form and how it will be used"
                  className="max-w-3xl min-h-32 text-base py-3 px-4 border-muted-foreground/20 focus-visible:ring-primary/50 resize-y"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t py-4 px-6 bg-muted/10">
              <Button 
                onClick={handleUpdateForm} 
                disabled={isSaving} 
                className="px-8 py-6 text-base font-medium shadow-sm hover:shadow-md transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save Form
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Questions list */}
          <Card className="shadow-md">
            <CardHeader className="bg-muted/50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>Edit or delete questions in your form</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleAddQuestion("single-choice")} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Single Choice
                  </Button>
                  <Button onClick={() => handleAddQuestion("multiple-choice")} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Multiple Choice
                  </Button>
                  <Button onClick={() => handleAddQuestion("open-ended")} variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Open-Ended
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {questions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No questions yet. Add your first question using the buttons above.</p>
                </div>
              ) : (
                questions.map((question, questionIndex) => (
                  <Card key={question._id} className="shadow-sm border-muted">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-medium">
                            {questionIndex + 1}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {question.type === "single-choice" 
                              ? "Single Choice" 
                              : question.type === "multiple-choice" 
                                ? "Multiple Choice" 
                                : "Open-Ended"}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteQuestion(question._id)}
                          className="hover:bg-red-100 hover:text-red-500 hover:border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <Input
                        value={question.text}
                        onChange={(e) => handleUpdateQuestion(question._id, "text", e.target.value)}
                        placeholder="Enter a question"
                        className="font-medium text-lg"
                      />
                      
                      <div className="pl-4 mt-4">
                        {question.type === "single-choice" && (
                          <RadioGroup className="space-y-3">
                            {question.options?.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <RadioGroupItem value={option} id={`option-${question._id}-${index}`} />
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const updatedOptions = [...question.options!];
                                    updatedOptions[index] = e.target.value;
                                    handleUpdateQuestion(question._id, "options", updatedOptions);
                                  }}
                                  placeholder="Option"
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteOption(question._id, index)}
                                  className="hover:bg-red-100 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              onClick={() => handleAddOption(question._id, "New option")}
                              variant="outline"
                              size="sm"
                              className="mt-2"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Option
                            </Button>
                          </RadioGroup>
                        )}

                        {question.type === "multiple-choice" && (
                          <div className="space-y-3">
                            {question.options?.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Checkbox id={`option-${question._id}-${index}`} />
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const updatedOptions = [...question.options!];
                                    updatedOptions[index] = e.target.value;
                                    handleUpdateQuestion(question._id, "options", updatedOptions);
                                  }}
                                  placeholder="Option"
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteOption(question._id, index)}
                                  className="hover:bg-red-100 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              onClick={() => handleAddOption(question._id, "New option")}
                              variant="outline"
                              size="sm"
                              className="mt-2"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Option
                            </Button>
                          </div>
                        )}

                        {question.type === "open-ended" && (
                          <Textarea
                            value={question.answer as string}
                            onChange={(e) => handleUpdateQuestion(question._id, "answer", e.target.value)}
                            placeholder="This is where respondents will type their answer"
                            className="h-24 bg-muted/50"
                            disabled
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}
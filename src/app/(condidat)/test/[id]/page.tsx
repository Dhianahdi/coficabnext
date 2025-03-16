"use client";

import { useQuery, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react"; // Ajout de useEffect
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { Loader2 } from "lucide-react"; // For the loader
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function FormPage() {

  const Me = useQuery(api.auth.getMe);
  const router = useRouter();

  useEffect(() => {
    if (Me && Me.department?.name !== null) {
      router.push("/access-denied");
    }
  }, [Me, router]);
  // Get the form ID from the URL
  const params = useParams();
  const formId = params.id as Id<"forms">;

  // Fetch the form and its questions
  const form = useQuery(api.mutations.form.getFormWithQuestions, { formId });
  const submitResponse = useMutation(api.mutations.form.submitResponse);
  const hasUserResponded = useMutation(api.mutations.form.hasUserRespondedToForm); // Ajout de la mutation

  // Get the current user
  const user = useQuery(api.auth.getMe);

  // State to store candidate responses
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // State for the loader
  const [hasAlreadyResponded, setHasAlreadyResponded] = useState(false); // State to track if the user has already responded

  // Vérifier si l'utilisateur a déjà répondu au formulaire
  useEffect(() => {
    if (user && formId) {
      const checkResponse = async () => {
        const hasResponded = await hasUserResponded({
          userId: user._id as Id<"users">, // Add the user ID
          formId: formId,   // Utiliser l'ID du formulaire
        });
        setHasAlreadyResponded(hasResponded);
      };
      checkResponse();
    }
  }, [user, formId, hasUserResponded]);

  // Handle responses to questions
  const handleResponseChange = (questionId: string, value: string | string[]) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Check if all questions have been answered
  const areAllQuestionsAnswered = () => {
    if (!form) return false;

    return form.questions.every((question) => {
      const response = responses[question._id];
      if (question.type === "open-ended") {
        return typeof response === "string" && response.trim() !== "";
      } else if (question.type === "single-choice" || question.type === "multiple-choice") {
        return Array.isArray(response) ? response.length > 0 : !!response;
      }
      return false;
    });
  };

  // Submit responses
  const handleSubmit = async () => {
    if (!form || !user) {
      toast.error("Form or user not found.");
      return;
    }

    // Ensure all questions have been answered
    if (!areAllQuestionsAnswered()) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true); // Enable the loader

    try {
      await submitResponse({
        formId,
        userId: user._id as Id<"users">, // Add the user ID
        responses: Object.entries(responses).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
      });

      toast.success("Responses submitted successfully!");
      setHasAlreadyResponded(true); // Mettre à jour l'état après la soumission
    } catch (error) {
      console.error("Error submitting responses:", error);
      toast.error("An error occurred while submitting responses.");
    } finally {
      setIsSubmitting(false); // Disable the loader
    }
  };

  if (!form) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Si l'utilisateur a déjà répondu, afficher un message
  if (hasAlreadyResponded) {
    return (
      <AdminPanelLayout>
        <ContentLayout title="Dashboard">
          <div className="p-6 space-y-6">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Form Already Submitted</CardTitle>
                  <CardDescription className="text-gray-600">
                    You have already submitted your responses to this form.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </ContentLayout>
      </AdminPanelLayout>
    );
  }

  return (
    <AdminPanelLayout>
      <ContentLayout title="Dashboard">
        <div className="p-6 space-y-6">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{form.title}</CardTitle>
                <CardDescription className="text-gray-600">{form.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {form.questions.map((question: any) => (
                  <div key={question._id} className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
                    <Label className="text-lg font-semibold">{question.text}</Label>
                    {question.type === "single-choice" && (
                      <RadioGroup
                        onValueChange={(value) => handleResponseChange(question._id, value)}
                      >
                        {question.options?.map((option: any, index: any) => (
                          <div key={index} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${question._id}-${index}`} />
                            <Label htmlFor={`${question._id}-${index}`}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {question.type === "multiple-choice" && (
                      <div className="space-y-2">
                        {question.options?.map((option: any, index: any) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${question._id}-${index}`}
                              onCheckedChange={(checked) => {
                                const currentAnswers = (responses[question._id] || []) as string[];
                                const updatedAnswers = checked
                                  ? [...currentAnswers, option]
                                  : currentAnswers.filter((ans) => ans !== option);
                                handleResponseChange(question._id, updatedAnswers);
                              }}
                            />
                            <Label htmlFor={`${question._id}-${index}`}>{option}</Label>
                          </div>
                        ))}
                      </div>
                    )}
                    {question.type === "open-ended" && (
                      <Textarea
                        placeholder="Your answer..."
                        value={(responses[question._id] as string) || ""}
                        onChange={(e) => handleResponseChange(question._id, e.target.value)}
                        className="mt-2"
                      />
                    )}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Responses"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}
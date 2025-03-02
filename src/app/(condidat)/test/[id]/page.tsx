"use client";

import { useQuery, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { useState } from "react";
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
import { Loader2 } from "lucide-react"; // Pour le loader

export default function FormPage() {
  // Récupérer l'ID du formulaire depuis l'URL
  const params = useParams();
  const formId = params.id as Id<"forms">;

  // Récupérer le formulaire et ses questions
  const form = useQuery(api.mutations.form.getFormWithQuestions, { formId });
  const submitResponse = useMutation(api.mutations.form.submitResponse);

  // Récupérer l'utilisateur actuel
  const user = useQuery(api.auth.getMe);

  // État pour stocker les réponses du candidat
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // État pour le loader

  // Gérer les réponses aux questions
  const handleResponseChange = (questionId: string, value: string | string[]) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Vérifier si toutes les questions ont une réponse
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

  // Envoyer les réponses
  const handleSubmit = async () => {
    if (!form || !user) {
      toast.error("Formulaire ou utilisateur non trouvé.");
      return;
    }

    // Vérifier que toutes les questions ont une réponse
    if (!areAllQuestionsAnswered()) {
      toast.error("Veuillez répondre à toutes les questions avant de soumettre.");
      return;
    }

    setIsSubmitting(true); // Activer le loader

    try {
      await submitResponse({
        formId,
        userId: user.id as Id<"users">, // Ajouter l'ID de l'utilisateur
        responses: Object.entries(responses).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
      });

      toast.success("Réponses envoyées avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'envoi des réponses :", error);
      toast.error("Une erreur est survenue lors de l'envoi des réponses.");
    } finally {
      setIsSubmitting(false); // Désactiver le loader
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
    <div className="max-w-4xl mx-auto p-6">
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
                  placeholder="Votre réponse..."
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
                Envoi en cours...
              </>
            ) : (
              "Envoyer les réponses"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
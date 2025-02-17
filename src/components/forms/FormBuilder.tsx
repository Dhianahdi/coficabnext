"use client";

import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Textarea } from "../ui/textarea";
type QuestionType = "multiple-choice" | "single-choice" | "open-ended";

type Question = {
  question: string;
  type: "multiple-choice" | "single-choice" | "open-ended";
  options?: string[];
  answer?: string;
};

export default function TechnicalTestGenerator() {
  const [keywords, setKeywords] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualQuestion, setManualQuestion] = useState("");
  const [manualOptions, setManualOptions] = useState<string[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
    // Ajouter une nouvelle question
    const addQuestion = (type: QuestionType) => {
      const newQuestion: Question = {
        type,
        question: `Nouvelle question ${type === "multiple-choice" ? "à choix multiple" : type === "single-choice" ? "à choix unique" : "ouverte"}`,
        options: type !== "open-ended" ? [] : undefined,
        answer: type === "open-ended" ? "" : undefined,
      };
      setQuestions([...questions, newQuestion]);
    };
  
    // Mettre à jour une question
    const updateQuestion = (index: number, field: keyof Question, value: string | string[]) => {
      const updatedQuestions = [...questions];
      if (field === "options" && Array.isArray(value)) {
        updatedQuestions[index].options = value;
      } else if (field === "answer" && typeof value === "string") {
        updatedQuestions[index].answer = value;
      } else if (field === "question" && typeof value === "string") {
        updatedQuestions[index].question = value;
      }
      setQuestions(updatedQuestions);
    };
  
    // Ajouter une option à une question à choix multiple ou unique
    const addOption = (index: number, option: string) => {
      const updatedQuestions = [...questions];
      if (updatedQuestions[index].options) {
        updatedQuestions[index].options!.push(option);
      }
      setQuestions(updatedQuestions);
    };
  
  // Fonction pour ajouter une question manuelle
  const addManualQuestion = () => {
    if (manualQuestion.trim()) {
      setQuestions([
        ...questions,
        { question: manualQuestion, type: "open-ended" },
      ]);
      setManualQuestion("");
    }
  };

  // Fonction pour supprimer une question
  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // Fonction pour générer un test technique avec Gemini
  const generateTechnicalTest = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBX_Yq9iRL7hqCEwpZeUP4zepSaEk33yag",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Génère ${numberOfQuestions} questions techniques sur ${keywords}. 
                    Formatte la réponse uniquement en JSON comme ceci :
                    [
                      { "question": "Question 1", "type": "multiple-choice", "options": ["Option 1", "Option 2", "Option 3"] },
                      { "question": "Question 2", "type": "single-choice", "options": ["Option 1", "Option 2"] },
                      { "question": "Question 3", "type": "open-ended" }
                    ]`
                  }
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = rawText.match(/\[\s*{[\s\S]*}\s*\]/);
        if (!jsonMatch) {
          throw new Error("Aucun JSON valide détecté dans la réponse.");
        }

        const generatedQuestions = JSON.parse(jsonMatch[0]);
        setQuestions(generatedQuestions);
      } else {
        console.error("Erreur API :", data);
        alert("Erreur lors de la génération du test technique.");
      }
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      alert("Impossible de générer le test technique.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Générateur de Test Technique</h2>

      {/* Formulaire pour saisir les mots-clés et le nombre de questions */}
      <div className="space-y-4">
        <Label htmlFor="keywords" className="text-gray-700">
          Mots-clés :
        </Label>
        <Input
          id="keywords"
          type="text"
          value={keywords}
          onChange={(e:any) => setKeywords(e.target.value)}
          placeholder="Ex: React, Node.js, JavaScript"
        />

        <Label htmlFor="numberOfQuestions" className="text-gray-700">
          Nombre de questions :
        </Label>
        <Input
          id="numberOfQuestions"
          type="number"
          value={numberOfQuestions}
          onChange={(e:any) => setNumberOfQuestions(parseInt(e.target.value))}
          min="1"
          max="20"
        />

        <Button
          onClick={generateTechnicalTest}
          disabled={loading}
          className={`w-full ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Génération en cours..." : "Générer le Test Technique"}
        </Button>
      </div>

      {/* Ajout manuel de questions */}
      <div className="p-6 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Constructeur de Questionnaire</h2>

      {/* Boutons pour ajouter des questions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => addQuestion("multiple-choice")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Ajouter une question à choix multiple
        </button>
        <button
          onClick={() => addQuestion("single-choice")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Ajouter une question à choix unique
        </button>
        <button
          onClick={() => addQuestion("open-ended")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Ajouter une question ouverte
        </button>
      </div>

      {/* Liste des questions */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div
            key={index}
            className={`p-4 border rounded-md ${
              selectedQuestionIndex === index ? "border-blue-600" : "border-gray-300"
            }`}
            onClick={() => setSelectedQuestionIndex(index)}
          >
            {/* Champ pour modifier la question */}
            <input
              type="text"
              value={question.question}
              onChange={(e) => updateQuestion(index, "question", e.target.value)}
              className="w-full p-2 border rounded-md mb-2"
              placeholder="Entrez votre question"
            />

            {/* Affichage des options pour les questions à choix multiple ou unique */}
            {question.type !== "open-ended" && (
              <div className="space-y-2">
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center">
                    <input
                      type={question.type === "multiple-choice" ? "checkbox" : "radio"}
                      name={`question-${index}`}
                      value={option}
                      className="mr-2"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const updatedOptions = [...question.options!];
                        updatedOptions[optionIndex] = e.target.value;
                        updateQuestion(index, "options", updatedOptions);
                      }}
                      className="w-full p-1 border rounded-md"
                      placeholder="Option"
                    />
                  </div>
                ))}
                <button
                  onClick={() => addOption(index, "Nouvelle option")}
                  className="px-2 py-1 bg-gray-200 text-gray-800 rounded-md"
                >
                  + Ajouter une option
                </button>
              </div>
            )}

            {/* Champ de réponse pour les questions ouvertes */}
            {question.type === "open-ended" && (
              <textarea
                value={question.answer}
                onChange={(e) => updateQuestion(index, "answer", e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Réponse libre"
              />
            )}
          </div>
        ))}
      </div>
    </div>

      {/* Affichage du formulaire généré */}
      {questions.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-bold text-blue-700">Test Technique Généré :</h3>
          {questions.map((question, index) => (
            <Card key={index} className="p-4 border rounded-md bg-gray-100">
              <p className="font-semibold text-gray-800">{question.question}</p>
              {/* Options for multiple-choice or single-choice questions */}
              {question.type === "multiple-choice" && (
                <div className="space-y-2 mt-2">
                  {question.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center">
                      <input
                        type="checkbox"
                        name={`question-${index}`}
                        className="mr-2"
                      />
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              )}
              {question.type === "single-choice" && (
                <div className="space-y-2 mt-2">
                  {question.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        className="mr-2"
                      />
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              )}

              {question.type === "open-ended" && (
                <Textarea
                  className="w-full mt-2"
                  placeholder="Votre réponse..."
                />
              )}
              {/* Boutons pour supprimer et modifier */}
              <div className="mt-2 flex justify-between">
                <Button
                  onClick={() => deleteQuestion(index)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Supprimer
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import FormBuilder from "@/components/forms/FormBuilder";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function GenerateJobDescription() {
  const [keywords, setKeywords] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");

  // Générer une description de poste
  const generateJobDescription = async () => {
    setLoading(true);
    setDisplayedText("");
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
                    text: `Génère une description complète d'un poste en utilisant les mots-clés suivants : ${keywords}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        const description = data.candidates?.[0]?.content?.parts?.[0]?.text || "Aucune description générée.";
        setFullDescription(description);
      } else {
        console.error("Erreur API :", data);
        setFullDescription("Erreur lors de la génération.");
      }
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      setFullDescription("Impossible de générer la description.");
    }
    setLoading(false);
  };

  // Effet d'affichage progressif
  useEffect(() => {
    if (!fullDescription) return;

    let index = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + fullDescription[index]);
      index++;
      if (index === fullDescription.length) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, [fullDescription]);

  // Lire le fichier PDF via une API interne Next.js
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFile(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'extraction du texte.");
      }

      const data = await response.json();
      console.log("Texte extrait :", data.text);
      setExtractedText(data.text);
    } catch (error) {
      console.error("Erreur lors de l'extraction du PDF:", error);
    }
  };

  return (
    <AdminPanelLayout>
      <ContentLayout title="Générateur de Description de Poste et Extraction de CV">
        <div className="max-w-2xl mx-auto mt-10 p-6 border rounded-lg shadow-lg bg-white">
          <h1 className="text-3xl font-bold mb-6 text-blue-700 text-center">
            Générateur de Description de Poste
          </h1>
          <p className="text-gray-600 text-center mb-4">
            Entrez des mots-clés pour générer une description professionnelle du poste.
          </p>

          <textarea
            className="w-full p-3 border rounded-md text-gray-800"
            rows={4}
            placeholder="Ex: Développeur Full Stack, React, Node.js..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          ></textarea>

          <button
            className={`mt-4 px-5 py-2 w-full text-white font-semibold rounded-md transition ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={generateJobDescription}
            disabled={loading}
          >
            {loading ? "Génération en cours..." : "Générer la Description"}
          </button>

          {displayedText && (
            <div className="mt-6 p-4 border rounded-md bg-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Description Générée :
              </h2>
              <ReactMarkdown className="text-gray-800">{displayedText}</ReactMarkdown>
            </div>
          )}

          {/* Section d'extraction de CV */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">
              Extraction de CV
            </h2>
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer">
              <p className="text-gray-600">Sélectionnez un fichier PDF.</p>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer">
                Sélectionner un fichier
              </label>
            </div>

            {file && (
              <div className="mt-4 text-center">
                <p className="text-gray-800">Fichier sélectionné : {file.name}</p>
              </div>
            )}

            {extractedText && (
              <div className="mt-6 p-4 border rounded-md bg-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Texte Extrait :</h2>
                <pre className="text-gray-800 whitespace-pre-wrap">{extractedText}</pre>
              </div>
            )}
          </div>

            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <FormBuilder />
              </div>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}


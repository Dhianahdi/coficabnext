"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";

interface FormField {
  id: number;
  type: string;
  label: string;
  options?: string[];
  required?: boolean;
}

export default function FormBuilder() {
  const { register, handleSubmit } = useForm();
  const [fields, setFields] = useState<FormField[]>([]);
  const [fieldsData, setFieldsData] = useState<any>({});

  const addField = (type: string) => {
    setFields([
      ...fields,
      { id: Date.now(), type, label: `Question ${fields.length + 1}`, options: ["Option 1"], required: false },
    ]);
  };

  const updateLabel = (id: number, newLabel: string) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, label: newLabel } : field)));
  };

  const addOption = (id: number) => {
    setFields(
      fields.map((field) =>
        field.id === id && field.options
          ? { ...field, options: [...field.options, `Option ${field.options.length + 1}`] }
          : field
      )
    );
  };

  const toggleRequired = (id: number) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, required: !field.required } : field)));
  };

  const removeField = (id: number) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const onSubmit = (data: any) => {
    setFieldsData(data);
    console.log("Form Data:", data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl border">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">🔧 Form Builder</h2>

      {/* Boutons pour ajouter des champs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {["text", "textarea", "email", "password", "number", "radio", "checkbox", "select", "date", "time", "datetime-local", "file"].map((type) => (
          <Button key={type} onClick={() => addField(type)} className="text-sm font-medium px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all">
            + {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {/* Formulaire Dynamique */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="p-4 bg-gray-50 border rounded-lg relative shadow-sm">
            {/* Supprimer un champ */}
            <button
              type="button"
              onClick={() => removeField(field.id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              ✖
            </button>

            {/* Modifier le label */}
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateLabel(field.id, e.target.value)}
              className="border px-3 py-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />

            {/* Affichage des champs selon leur type */}
            {field.type === "text" && <input type="text" {...register(field.label, { required: field.required })} className="border p-2 w-full rounded-md" />}
            {field.type === "textarea" && <textarea {...register(field.label, { required: field.required })} className="border p-2 w-full rounded-md" />}
            {field.type === "email" && <input type="email" {...register(field.label, { required: field.required })} className="border p-2 w-full rounded-md" />}
            {field.type === "password" && <input type="password" {...register(field.label, { required: field.required })} className="border p-2 w-full rounded-md" />}
            {field.type === "number" && <input type="number" {...register(field.label, { required: field.required })} className="border p-2 w-full rounded-md" />}
            {field.type === "date" && <input type="date" {...register(field.label, { required: field.required })} className="border p-2 w-full rounded-md" />}
            {field.type === "time" && <input type="time" {...register(field.label, { required: field.required })} className="border p-2 w-full rounded-md" />}
            {field.type === "datetime-local" && <input type="datetime-local" {...register(field.label, { required: field.required })} className="border p-2 w-full rounded-md" />}
            {field.type === "file" && <input type="file" {...register(field.label)} className="border p-2 w-full rounded-md" />}

            {/* Radio Buttons */}
            {field.type === "radio" &&
              field.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input type="radio" {...register(field.label, { required: field.required })} value={option} />
                  <span>{option}</span>
                </label>
              ))}

            {/* Checkboxes */}
            {field.type === "checkbox" && (
              <label className="flex items-center space-x-2">
                <input type="checkbox" {...register(field.label)} />
                <span>{field.label}</span>
              </label>
            )}

            {/* Sélection */}
            {field.type === "select" && (
              <select {...register(field.label, { required: field.required })} className="border p-2 w-full rounded-md">
                {field.options?.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {/* Ajouter des options pour Radio & Select */}
            {(field.type === "radio" || field.type === "select") && (
              <Button onClick={() => addOption(field.id)} className="mt-2 text-sm font-medium px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md">
                + Ajouter une option
              </Button>
            )}

            {/* Activer/Désactiver le champ obligatoire */}
            <label className="flex items-center mt-3 space-x-2">
              <input type="checkbox" onChange={() => toggleRequired(field.id)} checked={field.required} />
              <span>Obligatoire</span>
            </label>
          </div>
        ))}

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md">
          ✅ Soumettre
        </Button>
      </form>

      {/* Affichage des données */}
      <div className="mt-6 p-4 border rounded-md bg-gray-100">
        <h3 className="font-bold text-gray-800">📄 Données enregistrées :</h3>
        <pre className="text-sm text-gray-700">{JSON.stringify(fieldsData, null, 2)}</pre>
      </div>
    </div>
  );
}

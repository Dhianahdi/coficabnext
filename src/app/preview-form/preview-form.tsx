"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

export default function PreviewForm() {
    const { register, handleSubmit } = useForm();
    const [formFields, setFormFields] = useState([]);

    useEffect(() => {
        const storedFields = JSON.parse(localStorage.getItem("formFields") || "[]");
        setFormFields(storedFields);
    }, []);

    const onSubmit = (data: any) => {
        console.log("Submitted Data:", data);
        alert("Form submitted successfully!");
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-xl font-bold mb-4">📋 Preview Form</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                {formFields.map((field) => (
                    <div key={field.id}>
                        <label className="block text-sm font-medium">{field.label}</label>
                        <Input {...register(field.label)} type={field.type} placeholder={field.placeholder} />
                    </div>
                ))}
                <Button type="submit">Submit</Button>
            </form>
        </div>
    );
}

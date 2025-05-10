import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        // Récupérer les données du corps de la requête
        const { email, subject, template } = await req.json();

        // Vérifier que les champs requis sont présents
        if (!email || !subject || !template) {
            return NextResponse.json(
                { error: "Email, subject, and template are required" },
                { status: 400 }
            );
        }

        // Configurer le transporteur Nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail", // Changez ceci en fonction de votre fournisseur
            auth: {
                user: "mongi.nahdi@gmail.com",
                pass: "otaz swng dwug aitd",
            },
        });

        // Envoyer l'e-mail
        await transporter.sendMail({
            from: "mongi.nahdi@gmail.com", // L'adresse e-mail de l'expéditeur
            to: email, // L'adresse e-mail du destinataire
            subject: subject, // Le sujet de l'e-mail
            html: template, // Le contenu HTML du template
        });

        // Réponse de succès
        return NextResponse.json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Failed to send email" },
            { status: 500 }
        );
    }
}
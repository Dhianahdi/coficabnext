import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { email, phone } = await req.json();
        if (!email || !phone) {
            return NextResponse.json({ error: "Email et téléphone sont requis" }, { status: 400 });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        const transporter = nodemailer.createTransport({
            service: "gmail", // Change this based on your provider
            auth: {
                user: "mongi.nahdi@gmail.com",
                pass: "otaz swng dwug aitd",
            },
        });
        const emailTemplate = `
        <div style="font-family: 'Arial', sans-serif; background-color: #ffffff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #f0f4f8; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #003366; color: #fff; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Verification Code</h1>
                </div>
                <div style="padding: 20px;">
                    <p style="font-size: 16px; color: #333;">Hi there,</p>
                    <p style="font-size: 16px; color: #333;">Your verification code is:</p>
                    <h2 style="font-size: 32px; font-weight: bold; color: #003366;">${verificationCode}</h2>
                    <p style="font-size: 16px; color: #333;">Please use this code to complete your registration.</p>
                </div>
                <div style="background-color: #003366; color: #fff; padding: 20px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
                    <p style="margin: 0; font-size: 14px;">Thank you for using our service.</p>
                </div>
            </div>
        </div>
    `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Code de vérification",
            html:emailTemplate,
        });

        return NextResponse.json({ message: "Email envoyé", code: verificationCode });
    } catch (error) {
        console.error("Erreur :", error);
        return NextResponse.json({ error: "Échec de l'envoi" }, { status: 500 });
    }
}      
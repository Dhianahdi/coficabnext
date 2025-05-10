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
        
        // Template d'email amélioré
        const emailTemplate = `
   <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>COFICAB Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f7f7; color: #333333;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
                <!-- Header -->
                <tr>
                    <td align="center" style="padding: 30px 0; background: linear-gradient(135deg, #000000, #333333); border-top-left-radius: 12px; border-top-right-radius: 12px;">
                        <img src="https://coficab.com/wp-content/uploads/2023/01/logo-coficab-white.png" alt="COFICAB" width="180" style="display: block; margin: 0 auto;">
                    </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                    <td style="padding: 40px 30px;">
                        <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #000000; text-align: center;">Account Verification</h1>
                        
                        <p style="margin: 0 0 15px; font-size: 16px; line-height: 1.5;">Hello,</p>
                        
                        <p style="margin: 0 0 25px; font-size: 16px; line-height: 1.5;">Thank you for registering on the COFICAB portal. To complete your registration, please use the verification code below:</p>
                        
                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center; border-left: 4px solid #000000;">
                            <h2 style="margin: 0; font-size: 36px; letter-spacing: 5px; color: #000000; font-weight: 700;">${verificationCode}</h2>
                        </div>
                        
                        <p style="margin: 0 0 15px; font-size: 16px; line-height: 1.5;">This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
                        
                        <p style="margin: 30px 0 0; font-size: 16px; line-height: 1.5;">Best regards,<br>The COFICAB Team</p>
                    </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                    <td style="padding: 20px 30px; background-color: #f8f9fa; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">© 2023 COFICAB. All rights reserved.</p>
                        <p style="margin: 0; font-size: 13px; color: #999999;">This is an automated email, please do not reply.</p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER || "mongi.nahdi@gmail.com",
            to: email,
            subject: "Code de vérification COFICAB",
            html: emailTemplate,
        });

        return NextResponse.json({ message: "Email envoyé", code: verificationCode });
    } catch (error) {
        console.error("Erreur :", error);
        return NextResponse.json({ error: "Échec de l'envoi" }, { status: 500 });
    }
}
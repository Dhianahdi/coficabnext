import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    console.log("transporter");

    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: "Gmail", // Change this based on your provider
            auth: {
                user: "mongi.nahdi@gmail.com",
                pass: "otaz swng dwug aitd",
            },
        });
        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Verification Code",
            text: `Your verification code is: ${verificationCode}`,
            html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
        });

        return NextResponse.json({ message: "Verification email sent!" });
    } catch (error) {
        console.error("Email sending error:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
}

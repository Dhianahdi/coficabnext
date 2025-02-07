import { NextResponse } from "next/server";
import { getVerificationCode, deleteVerificationCode } from "@/lib/verificationStore"; // Importation

export async function POST(req: Request) {
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: "Email et code requis" }, { status: 400 });
        }

        const storedCode = getVerificationCode(email);

        if (storedCode && storedCode === parseInt(code)) {
            deleteVerificationCode(email); // Supprimer le code après vérification
            return NextResponse.json({ message: "Code valide, inscription confirmée !" });
        } else {
            return NextResponse.json({ error: "Code invalide ou expiré" }, { status: 400 });
        }
    } catch (error) {
        console.error("Erreur de vérification :", error);
        return NextResponse.json({ error: "Erreur lors de la vérification" }, { status: 500 });
    }
}

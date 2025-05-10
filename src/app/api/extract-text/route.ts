import { NextResponse } from "next/server";
import PDFParser from "pdf2json";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Fichier PDF invalide ou non fourni" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfParser = new PDFParser();

    const extractedText = await new Promise<string>((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData) => {
        console.error("Erreur PDF:", errData.parserError);
        reject("Erreur lors de l'extraction du PDF");
      });

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        const text = pdfData.Pages.map((page) =>
          page.Texts.map((text) => decodeURIComponent(text.R[0].T)).join(" ")
        ).join("\n").replace(/\s{2,}/g, " ").trim();

        resolve(text);
      });

      pdfParser.parseBuffer(buffer);
    });

    return NextResponse.json({ text: extractedText });
  } catch (error) {
    console.error("Erreur :", error);
    return NextResponse.json({ error: "Erreur lors de la lecture du PDF" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import PDFParser from "pdf2json";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Convertir le Blob en Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Créer un parser PDF
    const pdfParser = new PDFParser();

    return new Promise((resolve) => {
      pdfParser.on("pdfParser_dataError", (errData) => {
        console.error("Erreur PDF:", errData.parserError);
        resolve(NextResponse.json({ error: "Erreur lors de l'extraction du PDF" }, { status: 500 }));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        let extractedText = pdfData.Pages.map((page) =>
          page.Texts.map((text) => decodeURIComponent(text.R[0].T)).join(" ")
        ).join("\n");

        resolve(NextResponse.json({ text: extractedText }));
      });

      pdfParser.parseBuffer(buffer);
    });
  } catch (error) {
    console.error("Erreur :", error);
    return NextResponse.json({ error: "Erreur lors de la lecture du PDF" }, { status: 500 });
  }
}

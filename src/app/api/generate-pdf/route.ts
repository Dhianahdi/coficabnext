import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { html, fileName } = await request.json(); // Récupérer `fileName` de la requête

    // Lancer Puppeteer et générer le PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Chemin du dossier de destination
    const uploadDir = path.join(process.cwd(), "public", "uploads", "rapports");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Créer le dossier s'il n'existe pas
    }

    // Nom du fichier PDF
    const pdfFileName = fileName+".pdf";
    const pdfFilePath = path.join(uploadDir, pdfFileName);

    // Enregistrer le PDF dans le dossier
    fs.writeFileSync(pdfFilePath, pdfBuffer);

    // Retourner le chemin du fichier en réponse
    return NextResponse.json({ pdfUrl: `${pdfFileName}` });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ message: "Failed to generate PDF" }, { status: 500 });
  }
}
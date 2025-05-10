import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    // Récupérer le HTML et le nom du fichier depuis la requête
    const { html, fileName } = await req.json();

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    // Créer le dossier 'uploads' s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Générer un nom de fichier unique si non fourni
    const outputFileName = fileName || `report_${Date.now()}.pdf`;
    const outputPath = path.join(uploadsDir, `${outputFileName}.pdf`);

    // Lancer Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();

    // Définir le contenu HTML
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Générer le PDF
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    // Fermer le navigateur
    await browser.close();

    // Retourner le chemin du fichier PDF
    return NextResponse.json({
      success: true,
      filePath: `/uploads/${outputFileName}.pdf`,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
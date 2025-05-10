import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { PDFDocument } from "pdf-lib";

// Initialisation du client Convex pour les appels à la base de données
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Traite la requête POST pour soumettre une candidature
 */
export async function POST(request: NextRequest) {
  try {
    // Récupération des données du formulaire
    const formData = await request.formData();
    
    // Extraction des données de base
    const file = formData.get("file") as File;
    const jobId = formData.get("jobId") as string;
    const candidateId = formData.get("candidateId") as string;
    const coverLetter = formData.get("coverLetter") as string;
    const candidateName = formData.get("candidateName") as string;
    const cvText = formData.get("cvText") as string; // Texte du CV déjà extrait
    const fileName = formData.get("fileName") as string; // Nom du fichier déjà sauvegardé
    
    // Extraction des détails du job
    const jobTitle = formData.get("jobTitle") as string;
    const jobDepartment = formData.get("jobDepartment") as string;
    const jobRequirements = formData.get("jobRequirements") as string;
    const jobSalaryRange = formData.get("jobSalaryRange") as string;
    const jobLocation = formData.get("jobLocation") as string;
    const jobEmploymentType = formData.get("jobEmploymentType") as string;
    const jobExperienceLevel = formData.get("jobExperienceLevel") as string;

    // Validation des données
    if (!file || !jobId || !candidateId || !cvText || !fileName) {
      return NextResponse.json(
        { error: "Données manquantes pour la candidature" },
        { status: 400 }
      );
    }
    
    // Préparation des détails du job pour l'analyse
    const jobDetails = `
      Title: ${jobTitle}
      Department: ${jobDepartment}
      Requirements: ${jobRequirements}
      Salary Range: ${jobSalaryRange}
      Location: ${jobLocation}
      Employment Type: ${jobEmploymentType}
      Experience Level: ${jobExperienceLevel}
    `;
    
    // Génération du rapport avec Gemini
    const { score, reportHtml } = await getReportFromGemini(cvText, jobTitle, jobDetails);
    
    // Conversion du rapport HTML en PDF et upload sur Pinata
    const pdfFileName = `report_${Date.now()}`;
    const ipfsLink = await saveHtmlAsPdf(reportHtml, pdfFileName);
    
    // Enregistrement de l'offre dans la base de données
    await createOffer(
      jobId as Id<"jobs">,
      candidateId as Id<"users">,
      coverLetter,
      fileName,
      score,
      ipfsLink // Utiliser le lien IPFS au lieu du nom de fichier
    );
    
    // Création d'une notification
    await createNotification(
      "Application",
      `New applicatin from ${candidateName}.`,
      "",
      "success"
    );
    
    // Retour de la réponse
    return NextResponse.json(
      { 
        success: true, 
        message: "Candidature soumise avec succès",
        score,
        fileName,
        reportLink: ipfsLink // Inclure le lien IPFS dans la réponse
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error("Erreur lors du traitement de la candidature:", error);
    
    return NextResponse.json(
      { 
        error: "Erreur lors du traitement de la candidature", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Télécharge un fichier et le sauvegarde dans le dossier d'upload
 */
async function uploadFile(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Génération d'un nom de fichier unique
    const fileName = `${uuidv4()}_${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Création du dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    
    return fileName;
  } catch (error) {
    console.error("Erreur lors de l'upload du fichier:", error);
    throw new Error("Échec de l'upload du fichier");
  }
}

/**
 * Extrait le texte d'un fichier PDF en utilisant l'API extract-text
 */
async function extractTextFromFile(file: File): Promise<string> {
  try {
    // Création d'un FormData pour envoyer le fichier à l'API extract-text
    const formData = new FormData();
    formData.append("file", file);
    
    // Appel à l'API extract-text
    const response = await fetch("/api/extract-text", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error("Échec de l'extraction du texte via l'API extract-text");
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Erreur lors de l'extraction du texte:", error);
    throw new Error("Échec de l'extraction du texte du CV");
  }
}

/**
 * Génère un rapport d'analyse avec l'API Gemini
 */
async function getReportFromGemini(
  cvText: string,
  jobTitle: string,
  jobDetails: string
): Promise<{ score: number; reportHtml: string }> {
  try {
    // Template HTML avec des placeholders (même que dans votre code original)
    const templateHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CV Report</title>
        <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
        <style>
            /* Global Styles */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Poppins', sans-serif;
            }
            body {
                background: #f9f9f9;
                display: flex;
                justify-content: center;
                padding: 40px;
            }
            .report {
                width: 21cm;
                min-height: 29.7cm;
                background: #fff;
                padding: 40px;
                box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.1);
                border-radius: 10px;
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px solid #000;
            }
            .header h1 {
                font-size: 24px;
                color: #000;
            }
            .score {
                background: #ff0000;
                color: white;
                padding: 10px;
                border-radius: 8px;
                display: inline-block;
                font-weight: bold;
                margin-top: 10px;
            }
            .section {
                margin-top: 20px;
                padding: 15px;
                border-left: 4px solid #000;
                background: #f1f1f1;
                border-radius: 5px;
            }
            .section h2 {
                font-size: 18px;
                color: #000;
                margin-bottom: 10px;
            }
            .section p {
                font-size: 14px;
                color: #333;
                display: flex;
                align-items: center;
            }
            .section p i {
                margin-right: 10px;
            }
            .check { color: #4caf50; }
            .cross { color: #ff3b3b; }
            /* Skill Bar */
            .skill-bar {
                display: flex;
                align-items: center;
                margin: 10px 0;
            }
            .skill-name {
                width: 160px;
                font-size: 14px;
                font-weight: bold;
            }
            .bar {
                flex: 1;
                height: 10px;
                background: #eee;
                border-radius: 5px;
                overflow: hidden;
            }
            .bar span {
                display: block;
                height: 100%;
                border-radius: 5px;
            }
            .full { background: #4caf50; width: 100%; }
            .almost { background: #4caf50; width: 75%; }
            .mid { background: #4caf50; width: 50%; }
            .bad { background: #4caf50; width: 25%; }
            .no { background: #4caf50; width: 0%; }


            .footer {
                text-align: center;
                margin-top: 30px;
                font-size: 12px;
                color: #777;
            }
        </style>
    </head>
    <body>
        <div class="report">
            <div class="header">
                <h1>CV Report for Job: {{jobTitle}}</h1>
                <div class="score">Score: {{score}}/100</div>
            </div>
            <div class="section">
                <h2>Analysis</h2>
                <p>{{analysis}}</p>
            </div>
            <div class="section">
                <h2>Insights</h2>
                <p><i class="fas fa-check-circle check"></i> {{insight1}}</p>
                <p><i class="fas fa-check-circle check"></i> {{insight2}}</p>
                <p><i class="fas fa-check-circle check"></i> {{insight3}}</p>

            </div>
            <div class="section">
                <h2>Weaknesses</h2>
                <p><i class="fas fa-times-circle cross"></i> {{weakness1}}</p>
                <p><i class="fas fa-times-circle cross"></i> {{weakness2}}</p>
                <p><i class="fas fa-times-circle cross"></i> {{weakness3}}</p>

            </div>
            <div class="section">
                <h2>Skills</h2>
                <div class="skill-bar">
                    <span class="skill-name">{{Skills}}</span>
                    <div class="bar"><span class="full"></span></div>
                </div>
                <div class="skill-bar">
                    <span class="skill-name">{{Skills}}</span>
                    <div class="bar"><span class="full"></span></div>
                </div>
                <div class="skill-bar">
                    <span class="skill-name">{{Skills}}</span>
                    <div class="bar"><span class="almost"></span></div>
                </div>
            </div>
            <div class="footer">
                <p>Generated by AI Assistant</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const prompt = `
    Generate a detailed HTML report for the CV below applied to the job title "${jobTitle}". Use the following template and fill in the placeholders with relevant data. Ensure the report is professional, modern, and easy to read.
    
    ### Instructions:
    1. Replace placeholders like {{jobTitle}}, {{score}}, {{analysis}}, {{insight1}}, {{weakness1}}, etc., with actual data.
    2. Provide a clear and concise analysis of the candidate's strengths and weaknesses.
    3. Include specific insights and recommendations based on the CV and job requirements.
    4. Ensure the skills section reflects the candidate's proficiency levels accurately.
    
    ### Template:
    ${templateHtml}
    
    ### CV:
    ${cvText}
    
    ### Job Details:
    ${jobDetails}
    
    ### Additional Notes:
    - Use a professional tone.
    - Highlight key skills and experiences that match the job requirements.
    - Provide actionable recommendations for improvement.
    `;

    // Appel à l'API Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Échec de la récupération du rapport depuis l'API Gemini.");
    }

    const data = await response.json();
    const reportHtml = data.candidates[0].content.parts[0].text;

    // Extraction du score du rapport HTML
    const scoreMatch = reportHtml.match(/Score: (\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

    return { score, reportHtml };
  } catch (error) {
    console.error("Erreur lors de la génération du rapport:", error);
    throw new Error("Échec de la génération du rapport d'analyse");
  }
}

/**
 * Convertit le HTML en PDF et le sauvegarde
 */
async function saveHtmlAsPdf(html: string, fileName: string): Promise<string> {
  try {
    // Utilisation de puppeteer pour générer le PDF
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Définir le contenu HTML
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Créer le dossier de destination s'il n'existe pas
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Chemin complet du fichier PDF
    const pdfPath = path.join(uploadDir, `${fileName}.pdf`);
    
    // Générer le PDF
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });
    
    await browser.close();
    
    // Upload du fichier PDF sur Pinata
    const pinataResponse = await uploadToPinata(pdfPath, fileName);
    
    // Construire et retourner le lien IPFS
    const ipfsLink = `https://gateway.pinata.cloud/ipfs/${pinataResponse.IpfsHash}`;
    console.log('Lien IPFS du fichier:', ipfsLink);
    
    return ipfsLink;
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    throw new Error("Échec de la génération du PDF");
  }
}

/**
 * Crée une offre dans la base de données Convex
 */
async function createOffer(
  jobId: Id<"jobs">,
  candidateId: Id<"users">,
  coverLetter: string,
  resume: string,
  score: number,
  reportPdf: string
): Promise<void> {
  try {
    await convex.mutation(api.mutations.offers.createOffer, {
      jobId,
      candidateId,
      coverLetter,
      resume,
      status: "Pending",
      appliedAt: Date.now(),
      score,
      reportPdf,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'offre:", error);
    throw new Error("Échec de l'enregistrement de la candidature dans la base de données");
  }
}

/**
 * Crée une notification dans la base de données Convex
 */
async function createNotification(
  title: string,
  message: string,
  link: string,
  type: string
): Promise<void> {
  try {
    await convex.mutation(api.mutations.notifications.sendNotificationToRHDepartment, {
      title,
      message,
      link,
      type: type as "info" | "warning" | "error" | "success",
    });
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    throw new Error("Échec de l'envoi de la notification");
  }
}

/**
 * Upload un fichier sur Pinata IPFS
 */
async function uploadToPinata(filePath: string, fileName: string): Promise<any> {
  try {
    // Lecture du fichier
    const fileData = fs.readFileSync(filePath);
    
    // Création d'un FormData pour l'upload
    const formData = new FormData();
    formData.append('file', new Blob([fileData]), fileName);
    
    // Configuration des options pour Pinata
    const options = JSON.stringify({
      cidVersion: 0,
      customPinPolicy: {
        regions: [
          {
            id: 'FRA1',
            desiredReplicationCount: 1
          }
        ]
      }
    });
    formData.append('pinataOptions', options);
    
    // Métadonnées du fichier
    const metadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        type: 'application/pdf',
        date: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Envoi de la requête à l'API Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Échec de l'upload sur Pinata: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Fichier uploadé sur Pinata avec succès:', result);
    
    return result;
  } catch (error) {
    console.error("Erreur lors de l'upload sur Pinata:", error);
    throw new Error("Échec de l'upload du fichier sur Pinata");
  }
}
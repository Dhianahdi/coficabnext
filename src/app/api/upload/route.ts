// pages/api/upload/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    // Lire les données du fichier
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Générer un ID unique pour le fichier
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}-${file.name}`;

    // Chemin de sauvegarde du fichier
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filePath = path.join(uploadDir, fileName);

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Convertir le fichier en buffer et l'écrire sur le disque
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Retourner le nom du fichier
    return NextResponse.json({ fileName }, { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
// /pages/api/upload/route.ts
import { NextResponse } from "next/server";
import FormData from "form-data";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch"; // si tu es en Node.js, sinon global fetch est OK

const PINATA_JWT = process.env.PINATA_JWT!; // ajoute ce token dans .env.local

export async function POST(request: Request) {
  try {
    console.error("Pinata ON:");

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const uniqueId = uuidv4();
    let fileName = `${uniqueId}-${file.name}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const data = new FormData();
    data.append("file", buffer, fileName);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: data as any,
    });

    const pinataRes:any = await res.json();

    if (!res.ok) {
      console.error("Pinata error:", pinataRes);
      return NextResponse.json({ error: "Upload to Pinata failed" }, { status: 500 });
    }

    const ipfsHash = pinataRes.IpfsHash;
     fileName = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
     console.log("Upload Pinata réussi :", fileName);

    return NextResponse.json({ fileName }, { status: 200 });

  } catch (error) {
    console.error("Erreur upload Pinata:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

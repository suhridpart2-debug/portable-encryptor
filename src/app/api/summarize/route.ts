import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { base64Data, mimeType, fileName } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    if (!base64Data) {
      return NextResponse.json({ error: "No file data provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Multi-modal prompt
    const prompt = `
      You are an expert document and media analyst. 
      The user has decrypted this file: "${fileName}".
      
      Please analyze the content of this ${mimeType} file and provide a concise, 
      professional summary of what it contains. 
      
      - If it's a document (PDF/Text), summarize the key information.
      - If it's an image, describe what is in the image and any text visible.
      - Keep it under 4 bullet points.
    `;

    // Send to Gemini as inlineData (Multimodal)
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    return NextResponse.json({ summary: response.text() });

  } catch (error: any) {
    console.error("Gemini Multi-modal Error:", error);
    return NextResponse.json({ 
      error: `AI Analysis failed: ${error.message || 'Unknown error'}. Please ensure your API key supports Gemini 1.5 multi-modal inputs.` 
    }, { status: 500 });
  }
}

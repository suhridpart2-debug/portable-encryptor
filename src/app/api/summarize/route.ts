import OpenAI from "openai";
import { NextResponse } from "next/server";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { base64Data, history, mimeType, fileName } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    let messages: any[] = [
      {
        role: "system",
        content: `You are an expert analyst. 
        - If 'ACTUAL CONTENT' is provided, summarize it in 4 detailed bullet points.
        - If no content is found, use the filename "${fileName}" for a speculative summary.
        - ALWAYS prioritize the 'ACTUAL CONTENT' if it exists.`
      }
    ];

    if (history && history.length > 0) {
      messages = [...messages, ...history];
    } else {
      let userPrompt = `Analyze the content of the file: ${fileName}`;
      let userContent: any[] = [{ type: "text", text: userPrompt }];

      // CASE 1: Images (Groq Vision)
      if (mimeType?.startsWith("image/") && base64Data) {
        userContent.push({
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${base64Data}` }
        });
      } 
      // CASE 2: PDFs (Extract Text via PDF.js)
      else if (mimeType === "application/pdf" && base64Data) {
        try {
          const buffer = Buffer.from(base64Data, "base64");
          const uint8Array = new Uint8Array(buffer);
          
          // Load PDF without worker for simpler server-side execution
          const loadingTask = pdfjs.getDocument({
            data: uint8Array,
            useSystemFonts: true,
            disableFontFace: true,
          });
          
          const pdfDoc = await loadingTask.promise;
          let extractedText = "";
          
          // Read up to 10 pages
          const numPages = Math.min(pdfDoc.numPages, 10);
          for (let i = 1; i <= numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item: any) => item.str).join(" ");
            extractedText += pageText + "\n";
          }

          if (extractedText.trim()) {
            console.log(`Extracted ${extractedText.length} characters from PDF.`);
            userContent[0].text += `\n\nACTUAL CONTENT FROM PDF:\n${extractedText.substring(0, 8000)}`;
          } else {
            console.log("No text extracted from PDF (possible scanned image).");
          }
        } catch (err) {
          console.error("PDF.js Server Error:", err);
        }
      }

      messages.push({ role: "user", content: userContent });
    }

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: messages,
      max_tokens: 1000,
    });

    return NextResponse.json({ summary: response.choices[0].message.content });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

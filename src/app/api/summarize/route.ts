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
        - Analyze the provided visual content (image or PDF snapshot) thoroughly.
        - Summarize the key findings in clear, professional bullet points.
        - If multiple topics are present, group them logically.`
      }
    ];

    if (history && history.length > 0) {
      messages = [messages[0], ...history];
    } else {
      let userPrompt = `Analyze the content of the file: ${fileName}`;
      let userContent: any[] = [{ type: "text", text: userPrompt }];

      if (base64Data) {
        userContent.push({
          type: "image_url",
          image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${base64Data}` }
        });
      } 

      messages.push({ role: "user", content: userContent });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    return NextResponse.json({ summary: response.choices[0].message.content });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

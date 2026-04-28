import OpenAI from "openai";
import { NextResponse } from "next/server";

// Configure xAI (Grok) Client
const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY || "",
  baseURL: "https://api.x.ai/v1",
});

export async function POST(req: Request) {
  try {
    const { base64Data, mimeType, fileName } = await req.json();
    const apiKey = process.env.XAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "XAI_API_KEY not configured in Vercel" }, { status: 500 });
    }

    if (!base64Data) {
      return NextResponse.json({ error: "No file data provided" }, { status: 400 });
    }

    // Determine the message structure based on mimeType
    let content: any[] = [
      {
        type: "text",
        text: `You are an expert analyst. The user has decrypted a file named "${fileName}". Please provide a concise summary (under 4 bullet points) of its content.`,
      }
    ];

    // If it's an image, use Grok's vision capabilities
    if (mimeType.startsWith("image/")) {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${base64Data}`,
        },
      });
    } else {
      // For non-image files (like PDF/TXT), we'll append the data as text if possible
      // Note: Grok-vision-beta primarily supports images. 
      // For real PDF analysis, a dedicated PDF parser is usually better, 
      // but we'll try sending the context.
      content[0].text += `\n\nFile Type: ${mimeType}\n(Note: If this is a document, analyze the text patterns if visible in the provided data).`;
    }

    const response = await xai.chat.completions.create({
      model: "grok-vision-beta",
      messages: [
        {
          role: "user",
          content: content,
        },
      ],
      max_tokens: 500,
    });

    const summary = response.choices[0].message.content;
    return NextResponse.json({ summary });

  } catch (error: any) {
    console.error("Grok AI Error:", error);
    
    // Check for common Vercel/Payload errors
    if (error.message?.includes("fetch failed")) {
      return NextResponse.json({ 
        error: "Connection to Grok AI failed. Please check your API key and network." 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      error: `Grok Analysis failed: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  }
}

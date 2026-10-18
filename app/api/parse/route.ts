import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    email: { type: Type.STRING },
    phone: { type: Type.STRING },
    location: { type: Type.STRING },
    summary: { type: Type.STRING },
    total_experience_years: { type: Type.NUMBER },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING },
          degree: { type: Type.STRING },
          year: { type: Type.STRING },
        },
      },
    },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          duration: { type: Type.STRING },
          highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
        },
      },
    },
  },
  required: ["name", "skills", "education", "experience"],
};

const PROMPT =
  "Extract structured data from this resume. Use only information present in the resume. " +
  "If a field is missing, use an empty string or empty list. Do not invent anything. " +
  "For skills, return short keywords only (1 to 3 words each, like 'Customer service' or 'Python'), never full sentences. " +
  "Keep the summary under 40 words.";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const text = (form.get("text") as string | null)?.trim();

    const parts: any[] = [{ text: PROMPT }];

    if (file && file.size > 0) {
      if (file.size > 4 * 1024 * 1024) {
        return NextResponse.json({ error: "PDF must be under 4 MB." }, { status: 400 });
      }
      const data = Buffer.from(await file.arrayBuffer()).toString("base64");
      parts.push({ inlineData: { mimeType: "application/pdf", data } });
    } else if (text) {
      parts.push({ text });
    } else {
      return NextResponse.json({ error: "Upload a PDF or paste resume text." }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ role: "user", parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1,
      },
    });

    return NextResponse.json(JSON.parse(response.text ?? "{}"));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not parse the resume. Try again." }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { prompt, department, patientData, currentLocale, context } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "AI Integration Key Missing. Please configure system environment." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const clinicalContext = `
      You are a Clinical Decision Support Assistant for a public health hospital.
      Department: ${department || "General"}
      Role: Assistive only (not autonomous). Your suggestions must be reviewed by a qualified clinician.
      Patient Data Context: ${JSON.stringify(patientData || {})}
      Additional Context: ${context || 'None'}
      Instructions: Provide concise, evidence-based clinical reasoning or summaries. 
      Always include a disclaimer that the final decision rests with the attending provider.
      IMPORTANT: Your response MUST be in the following language: ${currentLocale === 'pt' ? 'Portuguese' : 'English'}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${clinicalContext}\n\nUser Prompt: ${prompt || "Analyze the patient context."}`
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    console.error("Clinical AI API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate recommendation" }, { status: 500 });
  }
}

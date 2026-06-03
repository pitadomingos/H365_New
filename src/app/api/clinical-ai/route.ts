import { GoogleGenAI } from '@google/genai';

/**
 * API Route Handler to stream Clinical Decision Support recommendations chunk-by-chunk.
 * Incorporates concise prompt directives to reduce latency.
 */
export async function POST(req: Request) {
  try {
    const { prompt, department, patientData, currentLocale, context } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI Integration Key Missing. Please configure system environment." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Performance optimization: Enforce short output length to directly minimize token generation time
    const clinicalContext = `
      You are a Clinical Decision Support Assistant for a public health hospital.
      Department: ${department || "General"}
      Role: Assistive only (not autonomous). Your suggestions must be reviewed by a qualified clinician.
      Patient Data Context: ${JSON.stringify(patientData || {})}
      Additional Context: ${context || 'None'}
      Instructions: Provide EXTREMELY concise, evidence-based clinical reasoning or summaries in bullet points.
      Do NOT include long explanations or conversational filler. Keep recommendations brief (max 3-5 short bullets) to minimize generation latency.
      Always include a brief standard disclaimer that the final decision rests with the attending provider.
      IMPORTANT: Your response MUST be in the following language: ${currentLocale === 'pt' ? 'Portuguese' : 'English'}.
    `;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: `${clinicalContext}\n\nUser Prompt: ${prompt || "Analyze the patient context."}`
          });

          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (e: any) {
          console.error("Streaming Generation Error:", e);
          controller.enqueue(new TextEncoder().encode(`Error during generation: ${e.message || "Failed to generate stream"}`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error: any) {
    console.error("Clinical AI API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to generate recommendation" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

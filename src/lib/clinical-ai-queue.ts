
import { GoogleGenAI } from "@google/genai";

export interface AIQueueItem {
  id: string;
  requestId: string;
  patientId?: string;
  patientName?: string;
  department: string;
  prompt: string;
  context: any;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  result?: string;
  createdAt: string;
  syncedAt?: string;
  error?: string;
}

const STORAGE_KEY = 'h365_clinical_ai_queue';

export const getAIQueue = (): AIQueueItem[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveAIQueue = (queue: AIQueueItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
};

export const addToQueue = (item: Omit<AIQueueItem, 'id' | 'createdAt' | 'status'>): AIQueueItem => {
  const queue = getAIQueue();
  const newItem: AIQueueItem = {
    ...item,
    id: Math.random().toString(36).substring(2, 11),
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  queue.unshift(newItem); // Newest first
  saveAIQueue(queue);
  return newItem;
};

export const syncQueue = async (onProgress?: (id: string, result: string | null, error?: string) => void) => {
  const queue = getAIQueue();
  const pending = queue.filter(item => item.status === 'pending' || item.status === 'failed');
  
  if (pending.length === 0) return;

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Broadband Sync Failed: AI Integration Key Missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  for (const item of pending) {
    try {
      item.status = 'syncing';
      saveAIQueue(queue);
      const index = queue.findIndex(i => i.id === item.id);
      
      const clinicalContext = `
        You are performing a retrospective Clinical Audit for a public health hospital.
        Department: ${item.department || "General"}
        Task: Analyze the provided record for clinical safety, missing flags, or suggested optimizations.
        Patient Data: ${JSON.stringify(item.context || {})}
        Instructions: Provide a concise audit summary. Focus on safety and evidence-based recommendations.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash", // Use 1.5 flash for batch auditing
        contents: `${clinicalContext}\n\nClinician Inquiry/Notes: ${item.prompt || "General Record Audit"}`,
      });

      const resultText = response.response.text();
      queue[index].status = 'completed';
      queue[index].result = resultText;
      queue[index].syncedAt = new Date().toISOString();
      onProgress?.(item.id, resultText);
    } catch (err: any) {
      console.error(`Sync error for item ${item.id}:`, err);
      const index = queue.findIndex(i => i.id === item.id);
      queue[index].status = 'failed';
      queue[index].error = err.message || "Network Error";
      onProgress?.(item.id, null, err.message);
    } finally {
      saveAIQueue(queue);
    }
  }
};

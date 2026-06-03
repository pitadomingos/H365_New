
'use server';

import { treatmentRecommendation, TreatmentRecommendationInput, TreatmentRecommendationOutput } from "@/ai/flows/treatment-recommendation";
import { getPatientClinicalContext, ClinicalContext } from "@/lib/clinical-data";

export async function getTreatmentRecommendationAction(
  input: TreatmentRecommendationInput
): Promise<TreatmentRecommendationOutput | { error: string }> {
  try {
    if (!input.symptoms && !input.labResults && !input.imagingData && !input.patientId) {
        return { error: "Please provide at least one input: symptoms, lab results, imaging data, or patient ID." };
    }
    
    // Provide a mock response if no API key is configured (for tests/CI)
    if (!process.env.GEMINI_API_KEY) {
        // slight delay to mock network request
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            diagnosis: "Mocked Viral URI (Common Cold)",
            prescription: "Paracetamol 500mg every 8 hours as needed for fever.",
            recommendations: "Rest, hydration, and return if symptoms worsen."
        };
    }

    const result = await treatmentRecommendation(input);
    return result;
  } catch (error) {
    console.error("Error in treatment recommendation flow:", error);
    return { error: "Failed to get treatment recommendation. Please try again." };
  }
}

export async function getPatientContextAction(nationalId: string): Promise<ClinicalContext | null> {
  return await getPatientClinicalContext(nationalId);
}

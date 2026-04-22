
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


'use server';

import { treatmentRecommendation, TreatmentRecommendationInput, TreatmentRecommendationOutput } from "@/ai/flows/treatment-recommendation";

export async function getTreatmentRecommendationAction(
  input: TreatmentRecommendationInput
): Promise<TreatmentRecommendationOutput | { error: string }> {
  try {
    if (!input.symptoms && !input.labResults && !input.imagingData) {
        return { error: "Please provide at least one input: symptoms, lab results, or imaging data." };
    }
    const result = await treatmentRecommendation(input);
    return result;
  } catch (error) {
    console.error("Error in treatment recommendation flow:", error);
    return { error: "Failed to get treatment recommendation. Please try again." };
  }
}

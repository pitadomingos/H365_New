
// treatment-recommendation.ts
'use server';

/**
 * @fileOverview An AI agent that provides treatment recommendations based on lab results, imaging data, and symptoms.
 *
 * - treatmentRecommendation - A function that handles the treatment recommendation process.
 * - TreatmentRecommendationInput - The input type for the treatmentRecommendation function.
 * - TreatmentRecommendationOutput - The return type for the treatmentRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getPatientClinicalContext } from '@/lib/clinical-data';

const TreatmentRecommendationInputSchema = z.object({
  labResults: z.string().describe('The patient\'s lab results.').optional(),
  imagingData: z.string().describe('The patient\'s imaging data.').optional(),
  symptoms: z.string().describe('The patient\'s symptoms, chief complaint, vitals, and relevant medical history.'),
  patientId: z.string().describe('The patient\'s national ID to fetch clinical context.').optional(),
});
export type TreatmentRecommendationInput = z.infer<typeof TreatmentRecommendationInputSchema>;

const TreatmentRecommendationOutputSchema = z.object({
  diagnosis: z.string().describe('A ranked list of potential diagnoses based on the provided information.'),
  prescription: z.string().describe('A draft prescription including medication names, dosages, and frequencies.'),
  recommendations: z.string().describe('Further treatment recommendations, lifestyle advice, or follow-up suggestions.'),
});
export type TreatmentRecommendationOutput = z.infer<typeof TreatmentRecommendationOutputSchema>;

export async function treatmentRecommendation(input: TreatmentRecommendationInput): Promise<TreatmentRecommendationOutput> {
  return treatmentRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'treatmentRecommendationPrompt',
  input: {schema: TreatmentRecommendationInputSchema.extend({
    contextLabs: z.string().optional(),
    contextImaging: z.string().optional(),
  })},
  output: {schema: TreatmentRecommendationOutputSchema},
  prompt: `You are an expert medical doctor specializing in providing treatment recommendations. 
Based on the comprehensive patient information provided below, including symptoms, medical history, lab results (both current and historical context), and imaging data (both current and historical context), please generate a response with the following distinct sections:

1.  **Potential Diagnoses**: Provide a ranked list of potential diagnoses.
2.  **Draft Prescription**: Suggest a draft prescription, including medication names, dosages, and frequencies.
3.  **Treatment Recommendations**: Offer further treatment recommendations, lifestyle advice, or necessary follow-up actions.

Be thorough and consider any historical clinical data provided alongside current observations.

Patient Information:
Symptoms & History: {{{symptoms}}}

Current Observation Lab Results: {{{labResults}}}
Historical/Context Lab Results: {{{contextLabs}}}

Current Observation Imaging Data: {{{imagingData}}}
Historical/Context Imaging Data: {{{contextImaging}}}`,
});

const treatmentRecommendationFlow = ai.defineFlow(
  {
    name: 'treatmentRecommendationFlow',
    inputSchema: TreatmentRecommendationInputSchema,
    outputSchema: TreatmentRecommendationOutputSchema,
  },
  async (input): Promise<TreatmentRecommendationOutput> => {
    console.log('AI Flow Input:', JSON.stringify(input, null, 2)); 

    let contextLabs = "";
    let contextImaging = "";

    if (input.patientId) {
      const context = await getPatientClinicalContext(input.patientId);
      if (context) {
        contextLabs = context.recentLabs;
        contextImaging = context.recentImaging;
      }
    }

    const { output } = await prompt({
      ...input,
      contextLabs,
      contextImaging,
      labResults: input.labResults || "N/A",
      imagingData: input.imagingData || "N/A",
    });

    if (!output || !output.diagnosis || !output.prescription || !output.recommendations) { 
      console.error('AI prompt did not return the expected output structure:', output);
      throw new Error('AI failed to generate a valid and complete recommendation structure. Some fields might be missing.');
    }
    return output;
  }
);

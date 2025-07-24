'use server';
/**
 * @fileOverview Crop disease diagnosis flow using image analysis.
 *
 * - diagnoseCropDisease - A function that diagnoses crop diseases from an image.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {translateText} from '@/ai/flows/translate-text';
import {
  DiagnoseCropDiseaseInput,
  DiagnoseCropDiseaseInputSchema,
  DiagnoseCropDiseaseOutput,
  DiagnoseCropDiseaseOutputSchema,
} from '@/ai/definitions';

export async function diagnoseCropDisease(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
  return diagnoseCropDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseCropDiseasePrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: z.object({
    photoDataUri: z.string(),
    query: z.string(),
  })},
  output: {schema: DiagnoseCropDiseaseOutputSchema},
  prompt: `You are an expert in diagnosing crop diseases.

  Analyze the following image of a crop and answer the user's query. Provide a diagnosis of any diseases or issues present.

  User Query: {{{query}}}
  Crop Photo: {{media url=photoDataUri}}`,
});

const diagnoseCropDiseaseFlow = ai.defineFlow(
  {
    name: 'diagnoseCropDiseaseFlow',
    inputSchema: DiagnoseCropDiseaseInputSchema,
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async ({ photoDataUri, query, targetLanguage }) => {
    const {output} = await prompt({ photoDataUri, query });
    if (!output) {
      throw new Error('Failed to get diagnosis from the model.');
    }
    const translatedDiagnosis = await translateText({ text: output.diagnosis, targetLanguage });
    return { diagnosis: translatedDiagnosis.translatedText };
  }
);

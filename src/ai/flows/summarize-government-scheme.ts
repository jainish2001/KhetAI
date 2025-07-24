'use server';

/**
 * @fileOverview A flow that summarizes government schemes for farmers.
 *
 * - summarizeGovernmentScheme - A function that summarizes the scheme.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { translateText } from './translate-text';
import {
  SummarizeGovernmentSchemeInput,
  SummarizeGovernmentSchemeInputSchema,
  SummarizeGovernmentSchemeOutput,
  SummarizeGovernmentSchemeOutputSchema
} from '@/ai/definitions';


export async function summarizeGovernmentScheme(input: SummarizeGovernmentSchemeInput): Promise<SummarizeGovernmentSchemeOutput> {
  return summarizeGovernmentSchemeFlow(input);
}

const summarizeGovernmentSchemePrompt = ai.definePrompt({
  name: 'summarizeGovernmentSchemePrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: z.object({
    schemeName: z.string(),
    query: z.string(),
  })},
  output: {schema: SummarizeGovernmentSchemeOutputSchema},
  prompt: `You are an expert in Indian government agricultural schemes.
  You will provide a simplified summary of the scheme based on the user's query.

  Scheme Name: {{{schemeName}}}
  Query: {{{query}}}

  Provide a concise and easy-to-understand summary of the scheme, including key benefits and eligibility criteria, tailored to the farmer's query.
  Do not include information that is not available in the provided information. Limit the summary to three sentences.`,
});

const summarizeGovernmentSchemeFlow = ai.defineFlow(
  {
    name: 'summarizeGovernmentSchemeFlow',
    inputSchema: SummarizeGovernmentSchemeInputSchema,
    outputSchema: SummarizeGovernmentSchemeOutputSchema,
  },
  async ({ schemeName, query, targetLanguage }) => {
    const {output} = await summarizeGovernmentSchemePrompt({ schemeName, query });
    if (!output) {
      throw new Error('Failed to get summary from the model.');
    }
    const translatedSummary = await translateText({ text: output.summary, targetLanguage });
    return { summary: translatedSummary.translatedText };
  }
);

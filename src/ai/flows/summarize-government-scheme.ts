'use server';

/**
 * @fileOverview A flow that summarizes government schemes for farmers.
 *
 * - summarizeGovernmentScheme - A function that summarizes the scheme.
 * - SummarizeGovernmentSchemeInput - The input type for the summarizeGovernmentScheme function.
 * - SummarizeGovernmentSchemeOutput - The return type for the summarizeGovernmentScheme function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeGovernmentSchemeInputSchema = z.object({
  schemeName: z.string().describe('The name of the government scheme to summarize.'),
  query: z.string().describe('The query about the government scheme.'),
});
export type SummarizeGovernmentSchemeInput = z.infer<typeof SummarizeGovernmentSchemeInputSchema>;

const SummarizeGovernmentSchemeOutputSchema = z.object({
  summary: z.string().describe('A simplified summary of the government scheme.'),
});
export type SummarizeGovernmentSchemeOutput = z.infer<typeof SummarizeGovernmentSchemeOutputSchema>;

export async function summarizeGovernmentScheme(input: SummarizeGovernmentSchemeInput): Promise<SummarizeGovernmentSchemeOutput> {
  return summarizeGovernmentSchemeFlow(input);
}

const summarizeGovernmentSchemePrompt = ai.definePrompt({
  name: 'summarizeGovernmentSchemePrompt',
  input: {schema: SummarizeGovernmentSchemeInputSchema},
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
  async input => {
    const {output} = await summarizeGovernmentSchemePrompt(input);
    return output!;
  }
);

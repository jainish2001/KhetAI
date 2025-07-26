'use server';

/**
 * @fileOverview Fetches and summarizes mandi price insights using Google Search via Gemini.
 *
 * - getMandiPriceInsights - A function that fetches, analyzes, and summarizes mandi price data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { translateText } from './translate-text';
import {
    GetMandiPriceInsightsInput,
    GetMandiPriceInsightsInputSchema,
    GetMandiPriceInsightsOutput,
    GetMandiPriceInsightsOutputSchema,
} from '@/ai/definitions';

export async function getMandiPriceInsights(input: GetMandiPriceInsightsInput): Promise<GetMandiPriceInsightsOutput> {
  return getMandiPriceInsightsFlow(input);
}

const getMandiPriceInsightsPrompt = ai.definePrompt({
  name: 'getMandiPriceInsightsPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: z.object({
      crop: z.string(),
      location: z.string(),
  })},
  output: {schema: GetMandiPriceInsightsOutputSchema},
  prompt: `You are an expert agricultural analyst. Your task is to provide the latest mandi price for a specific crop in a given location using your access to Google Search.

Your summary must be a single paragraph and include:
- The approximate average price for the crop in the specified location.
- The general price range (minimum and maximum if available).
- A simple recommendation on whether it's a good time to sell, based on recent price trends.
- Suggest the better time when the farmer should sell his crop.

IMPORTANT:
- ALWAYS use the Indian Rupee symbol (?).
- ALWAYS state that the prices are per quintal.
- If you cannot find data for the specific location, state that and suggest looking for prices in a nearby major market.
- Your entire response must be enclosed within the 'summary' field of the JSON output.

Crop: {{{crop}}}
Location: {{{location}}}`,
});

const getMandiPriceInsightsFlow = ai.defineFlow(
  {
    name: 'getMandiPriceInsightsFlow',
    inputSchema: GetMandiPriceInsightsInputSchema,
    outputSchema: GetMandiPriceInsightsOutputSchema,
  },
  async ({ crop, location, targetLanguage }) => {
    // Step 1: Call the prompt to get insights from the model.
    const {output} = await getMandiPriceInsightsPrompt({ crop, location });

    if (!output) {
      throw new Error('Failed to get insights from the model.');
    }

    // Step 2: Translate the final summary.
    const translatedSummary = await translateText({ text: output.summary, targetLanguage });
    return { summary: translatedSummary.translatedText };
  }
);

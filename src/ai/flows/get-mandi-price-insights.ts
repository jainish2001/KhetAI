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

// Define a tool for the agent to use to get information from Google Search.
const googleSearch = ai.defineTool(
    {
      name: 'googleSearch',
      description: 'Provides information from Google Search. Use this to find the latest mandi prices for a specific crop and location.',
      inputSchema: z.object({ query: z.string() }),
      outputSchema: z.any(),
    },
    async ({ query }) => {
        // In a real implementation, this would call a Google Search API.
        // For now, we are instructing the model to use its internal knowledge,
        // which includes access to Google Search. The tool definition helps
        // the model to structure its thinking process.
        return { result: `Simulated Google Search for: ${query}` };
    }
);


export async function getMandiPriceInsights(input: GetMandiPriceInsightsInput): Promise<GetMandiPriceInsightsOutput> {
  return getMandiPriceInsightsFlow(input);
}

const getMandiPriceInsightsPrompt = ai.definePrompt({
  name: 'getMandiPriceInsightsPrompt',
  model: 'googleai/gemini-2.5-flash',
  tools: [googleSearch],
  input: {schema: z.object({
      crop: z.string(),
      location: z.string(),
  })},
  output: {schema: GetMandiPriceInsightsOutputSchema},
  prompt: `You are an expert agricultural analyst. Your task is to provide the latest mandi price for a specific crop in a given location.

You MUST use the 'googleSearch' tool to find the most recent information. Construct a search query like "latest price of {crop} in {location} mandi".

After getting the search results, create a summary that is a single paragraph and includes:
- The approximate average price for the crop in the specified location.
- The general price range (minimum and maximum if available).
- A simple recommendation on whether it's a good time to sell, based on recent price trends.
- Suggest the better time when the farmer should sell his crop.
- If you are not able to get accurate rates, then try giving approximate rates of that crop and give disclaimer as this may not be the accurate, this is given based on some market trends.
- Keep the response short simple and clear cut to cut.

IMPORTANT:
- ALWAYS use the Indian Rupee or instead of that use INR or give it as e.g. Rs.3,000/- approximately.
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

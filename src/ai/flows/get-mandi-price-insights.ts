'use server';

/**
 * @fileOverview Fetches and summarizes mandi price insights using the Agmarknet API and Gemini.
 *
 * - getMandiPriceInsights - A function that fetches, analyzes, and summarizes mandi price data.
 * - GetMandiPriceInsightsInput - The input type for the getMandiPriceInsights function.
 * - GetMandiPriceInsightsOutput - The return type for the getMandiPriceInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { translateText } from './translate-text';

const GetMandiPriceInsightsInputSchema = z.object({
  crop: z.string().describe('The crop to get mandi price insights for.'),
  location: z.string().describe('The location (e.g., city, district) to get mandi price insights for.'),
  targetLanguage: z.string().describe('The language to translate the response to (e.g., "hi", "en").'),
});
export type GetMandiPriceInsightsInput = z.infer<typeof GetMandiPriceInsightsInputSchema>;

const GetMandiPriceInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of recent mandi price trends for the specified crop and location.'),
});
export type GetMandiPriceInsightsOutput = z.infer<typeof GetMandiPriceInsightsOutputSchema>;

export async function getMandiPriceInsights(input: GetMandiPriceInsightsInput): Promise<GetMandiPriceInsightsOutput> {
  return getMandiPriceInsightsFlow(input);
}

const getAgmarknetData = ai.defineTool({
  name: 'getAgmarknetData',
  description: 'Fetches mandi price data from the Agmarknet API for a specific crop and location.',
  inputSchema: z.object({
    crop: z.string().describe('The crop to get mandi price data for.'),
    location: z.string().describe('The location (e.g., city, district) to get mandi price data for.'),
  }),
  outputSchema: z.string(), // Assuming the API returns a stringified JSON or a string
}, async (input) => {
  // TODO: Implement the actual API call to Agmarknet.  Replace the below placeholder.
  // This is just a placeholder to demonstrate the tool.
  return `Mandi price data for ${input.crop} in ${input.location} is currently unavailable via API.`;
});

const summarizeMandiPriceDataPrompt = ai.definePrompt({
  name: 'summarizeMandiPriceDataPrompt',
  model: 'googleai/gemini-1.5-flash-001',
  tools: [getAgmarknetData],
  input: {schema: z.object({
    crop: z.string().describe('The crop to get mandi price insights for.'),
    location: z.string().describe('The location (e.g., city, district) to get mandi price insights for.'),
  })},
  output: {schema: GetMandiPriceInsightsOutputSchema},
  prompt: `You are an expert agricultural analyst.  Using the getAgmarknetData tool, retrieve the mandi price data for the following crop and location, and summarize the recent price trends for a farmer.

Crop: {{{crop}}}
Location: {{{location}}}

Summarize the recent mandi price trends for the farmer, so they can make informed decisions about when and where to sell their produce.`,
});

const getMandiPriceInsightsFlow = ai.defineFlow(
  {
    name: 'getMandiPriceInsightsFlow',
    inputSchema: GetMandiPriceInsightsInputSchema,
    outputSchema: GetMandiPriceInsightsOutputSchema,
  },
  async ({ crop, location, targetLanguage }) => {
    const {output} = await summarizeMandiPriceDataPrompt({ crop, location });
    if (!output) {
      throw new Error('Failed to get insights from the model.');
    }
    const translatedSummary = await translateText({ text: output.summary, targetLanguage });
    return { summary: translatedSummary.translatedText };
  }
);

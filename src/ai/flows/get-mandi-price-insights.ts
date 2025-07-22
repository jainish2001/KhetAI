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

// This is a mock tool. In a real application, this would call an external API.
const getAgmarknetData = ai.defineTool({
  name: 'getAgmarknetData',
  description: 'Fetches mandi price data from the Agmarknet API for a specific crop and location.',
  inputSchema: z.object({
    crop: z.string().describe('The crop to get mandi price data for.'),
    location: z.string().describe('The location (e.g., city, district) to get mandi price data for.'),
  }),
  outputSchema: z.string(), // Returns a JSON string of mandi data.
}, async (input) => {
  const { crop, location } = input;
  const basePrice = Math.floor(Math.random() * (5000 - 1500 + 1)) + 1500; // Random base price between 1500-5000

  const mockData = {
    crop: crop,
    location: location,
    date: new Date().toISOString().split('T')[0],
    unit: 'quintal',
    markets: [
      {
        name: `${location} Main Market`,
        min_price: basePrice,
        max_price: basePrice + Math.floor(Math.random() * 500),
        modal_price: basePrice + Math.floor(Math.random() * 250),
      },
      {
        name: `${location} North Market`,
        min_price: basePrice - Math.floor(Math.random() * 200),
        max_price: basePrice + Math.floor(Math.random() * 300),
        modal_price: basePrice - Math.floor(Math.random() * 100),
      },
      {
        name: `Nearby Village Market`,
        min_price: basePrice - Math.floor(Math.random() * 300),
        max_price: basePrice + Math.floor(Math.random() * 100),
        modal_price: basePrice - Math.floor(Math.random() * 150),
      }
    ]
  };

  return JSON.stringify(mockData);
});

const summarizeMandiPriceDataPrompt = ai.definePrompt({
  name: 'summarizeMandiPriceDataPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: z.object({
      mandiData: z.string().describe('The JSON data received from the Agmarknet API tool.'),
  })},
  output: {schema: GetMandiPriceInsightsOutputSchema},
  prompt: `You are an expert agricultural analyst. Analyze the provided JSON data and provide a concise, easy-to-understand summary for a farmer.

Your summary must be a single paragraph and include:
- The approximate average price for the crop.
- The general price range (minimum and maximum).
- A simple recommendation on where they might get the best price.

IMPORTANT:
- ALWAYS use the Indian Rupee symbol (₹).
- ALWAYS state that the prices are per quintal.
- Your entire response must be enclosed within the 'summary' field of the JSON output.

Here is the data:
{{{mandiData}}}`,
});

const getMandiPriceInsightsFlow = ai.defineFlow(
  {
    name: 'getMandiPriceInsightsFlow',
    inputSchema: GetMandiPriceInsightsInputSchema,
    outputSchema: GetMandiPriceInsightsOutputSchema,
  },
  async ({ crop, location, targetLanguage }) => {
    // Step 1: Call the tool directly to get the data.
    const mandiData = await getAgmarknetData({ crop, location });

    // Step 2: Pass the data to the summarization prompt.
    const {output} = await summarizeMandiPriceDataPrompt({ mandiData });

    if (!output) {
      throw new Error('Failed to get insights from the model.');
    }

    // Step 3: Translate the final summary.
    const translatedSummary = await translateText({ text: output.summary, targetLanguage });
    return { summary: translatedSummary.translatedText };
  }
);
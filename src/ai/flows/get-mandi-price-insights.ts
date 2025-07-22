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
  outputSchema: z.string(), // Returns a JSON string of mandi data.
}, async (input) => {
  // In a real application, this would call the Agmarknet API.
  // For this demo, we are returning realistic but fictional data.
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
  tools: [getAgmarknetData],
  input: {schema: z.object({
    crop: z.string().describe('The crop to get mandi price insights for.'),
    location: z.string().describe('The location (e.g., city, district) to get mandi price insights for.'),
  })},
  output: {schema: GetMandiPriceInsightsOutputSchema},
  prompt: `You are an expert agricultural analyst. Use the getAgmarknetData tool to find the price for {{{crop}}} in {{{location}}}.

Analyze the data and provide a concise, easy-to-understand summary for a farmer.

Your summary must be a single paragraph and include:
- The approximate average price.
- The general price range (minimum and maximum).
- A simple recommendation on where they might get the best price.

IMPORTANT:
- ALWAYS use the Indian Rupee symbol (₹).
- ALWAYS state that the prices are per quintal.

Example Output:
"The current market price for Wheat in Delhi is approximately ₹2500 per quintal, with prices ranging from ₹2300 to ₹2800 across different markets. You may find the best price at the Delhi Main Market."`,
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

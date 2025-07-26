'use server';

/**
 * @fileOverview Fetches and summarizes mandi price insights using the Agmarknet API and Gemini.
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

// This is a mock tool. In a real application, this would call an external API.
const getAgmarknetData = ai.defineTool({
  name: 'getAgmarknetData',
  description: 'Fetches mandi price data from the Agmarknet API for a specific crop and location.',
  inputSchema: z.object({
    crop: z.string().describe('The crop to get mandi price data for.'),
    location: z.string().describe('The location (e.g., city, district) to get mandi price data for.'),
  }),
  outputSchema: z.string(), // Returns a JSON string of mandi data.
}, async ({ crop, location }) => {
    const apiKey = process.env.AGMARKNET_API_KEY;
    if (!apiKey) {
      throw new Error('AGMARKNET_API_KEY is not set in the environment variables.');
    }
    
    // The base URL for the Agmarknet API resource.
    const baseUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
    const url = `${baseUrl}?api-key=${apiKey}&format=json&limit=10&filters[district]=${location}&filters[commodity]=${crop}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const data = await response.json();

        if (!data.records || data.records.length === 0) {
            return JSON.stringify({ error: `No data found for ${crop} in ${location}. Please try a different crop or a nearby major city.` });
        }
        
        return JSON.stringify(data.records);

    } catch (error) {
        console.error('Error fetching from Agmarknet API:', error);
        return JSON.stringify({ error: 'Failed to fetch data from the Agmarknet API.' });
    }
});

const summarizeMandiPriceDataPrompt = ai.definePrompt({
  name: 'summarizeMandiPriceDataPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: z.object({
      mandiData: z.string().describe('The JSON data received from the Agmarknet API tool.'),
  })},
  output: {schema: GetMandiPriceInsightsOutputSchema},
  prompt: `You are an expert agricultural analyst. Analyze the provided JSON data, which contains mandi price records. If the JSON contains an error field, report that error to the user.

Your summary must be a single paragraph and include:
- The approximate average price for the crop across the listed markets.
- The general price range (minimum and maximum from all records).
- A simple recommendation on which market has the best modal price.
- Suggest the better time when the farmer should sell his crop.

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

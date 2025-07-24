'use server';
/**
 * @fileOverview A conversational agent that can answer questions about farming.
 *
 * - khetAIAgent - A function that handles the conversational agent process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {diagnoseCropDisease} from './diagnose-crop-disease';
import {getMandiPriceInsights} from './get-mandi-price-insights';
import {summarizeGovernmentScheme} from './summarize-government-scheme';
import { translateText } from './translate-text';
import {
  DiagnoseCropDiseaseOutputSchema,
  GetMandiPriceInsightsInputSchema,
  GetMandiPriceInsightsOutputSchema,
  SummarizeGovernmentSchemeInputSchema,
  SummarizeGovernmentSchemeOutputSchema,
  KhetAIAgentInput,
  KhetAIAgentInputSchema,
  KhetAIAgentOutput,
  KhetAIAgentOutputSchema
} from '@/ai/definitions';

// Note: We can't pass image data to this agent directly yet.
// For crop diagnosis, the user would be prompted to go to the specific page.
const cropDiseaseTool = ai.defineTool(
  {
    name: 'diagnoseCropDisease',
    description: 'Diagnoses crop diseases from a user query. This tool CANNOT analyze images. It can only answer text questions about crop diseases.',
    inputSchema: z.object({
      query: z.string().describe("The user's question about the crop disease."),
      targetLanguage: z.string().describe('The target language for the response.'),
    }),
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async (input) => diagnoseCropDisease({ photoDataUri: '', query: input.query, targetLanguage: input.targetLanguage })
);

const mandiPriceTool = ai.defineTool(
    {
      name: 'getMandiPriceInsights',
      description: 'Gets mandi price insights for a specific crop and location.',
      inputSchema: GetMandiPriceInsightsInputSchema,
      outputSchema: GetMandiPriceInsightsOutputSchema,
    },
    async (input) => getMandiPriceInsights(input)
  );

const govSchemeTool = ai.defineTool(
  {
    name: 'summarizeGovernmentScheme',
    description: 'Summarizes a government scheme for a farmer.',
    inputSchema: SummarizeGovernmentSchemeInputSchema,
    outputSchema: SummarizeGovernmentSchemeOutputSchema,
  },
  async (input) => summarizeGovernmentScheme(input)
);


export async function khetAIAgent(input: KhetAIAgentInput): Promise<KhetAIAgentOutput> {
  return khetAIAgentFlow(input);
}

const prompt = ai.definePrompt({
    name: 'khetAIAgentPrompt',
    model: 'googleai/gemini-1.5-flash',
    tools: [mandiPriceTool, govSchemeTool, cropDiseaseTool],
    system: `You are KhetAI, a friendly and helpful AI assistant for Indian farmers.
Your goal is to understand the user's question and use the available tools to provide a clear and concise answer in their selected language.
- For mandi prices, use the getMandiPriceInsights tool. The user's location is provided in the input.
- For government schemes, use the summarizeGovernmentScheme tool.
- For questions about crop diseases, use the diagnoseCropDisease tool. If the user wants to diagnose a disease from a photo, you must tell them to go to the "Crop Health" page to upload an image, as you cannot process images in this chat.
- If the user asks a general question or something you don't have a tool for, provide a helpful answer based on your general knowledge.
- Always be polite and address the farmer directly.
- The user's current location is: {{location}}. Use this for any location-based queries unless they specify a different one.
- The user's preferred language is {{targetLanguage}}. You MUST respond in this language. The tools will automatically handle translation, but your own conversational text must also be translated.`,
  });


const khetAIAgentFlow = ai.defineFlow(
    {
        name: 'khetAIAgentFlow',
        inputSchema: KhetAIAgentInputSchema,
        outputSchema: KhetAIAgentOutputSchema,
    },
    async (input) => {
        const {output} = await prompt(input.query, {
          context: {
            location: input.location,
            targetLanguage: input.targetLanguage,
          },
        });
        const responseText = output?.content?.parts[0]?.text || "I'm sorry, I couldn't find an answer to your question. Please try rephrasing it.";

        // Final translation check
        const translatedResponse = await translateText({ text: responseText, targetLanguage: input.targetLanguage });

        return { response: translatedResponse.translatedText };
    }
);

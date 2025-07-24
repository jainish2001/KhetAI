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
import { textToSpeech } from './text-to-speech';
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
import { translateText } from './translate-text';

const cropDiseaseTool = ai.defineTool(
  {
    name: 'diagnoseCropDisease',
    description: 'Diagnoses crop diseases from a user query and an image. Use this tool if the user provides an image or asks a question about crop health.',
    inputSchema: z.object({
      query: z.string().describe("The user's question about the crop disease."),
      photoDataUri: z.string().describe("A photo of the crop as a data URI."),
      targetLanguage: z.string().describe('The target language for the response.'),
    }),
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async (input) => diagnoseCropDisease(input)
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
- If the user provides an image, you MUST use the 'diagnoseCropDisease' tool.
- For mandi prices, use the getMandiPriceInsights tool. The user's location is provided in the input.
- For government schemes, use the summarizeGovernmentScheme tool.
- For questions about crop diseases (even without an image), use the diagnoseCropDisease tool.
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
        const promptPayload = input.photoDataUri 
            ? [ {text: input.query}, {media: {url: input.photoDataUri}}] 
            : input.query;

        const {output} = await prompt(promptPayload, {
          context: {
            location: input.location,
            targetLanguage: input.targetLanguage,
            photoDataUri: input.photoDataUri || '', // Pass it to context for the tool
            query: input.query
          },
        });
        const responseText = output?.content?.parts[0]?.text || "I'm sorry, I couldn't find an answer to your question. Please try rephrasing it.";

        const translatedResponse = await translateText({ text: responseText, targetLanguage: input.targetLanguage });
        const speech = await textToSpeech({text: translatedResponse.translatedText});

        return { 
          response: translatedResponse.translatedText,
          audio: speech.audio,
        };
    }
);

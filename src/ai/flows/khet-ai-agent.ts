'use server';
/**
 * @fileOverview A conversational agent that can answer questions about farming.
 *
 * - khetAIAgent - A function that handles the conversational agent process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { diagnoseCropDisease } from './diagnose-crop-disease';
import { getMandiPriceInsights } from './get-mandi-price-insights';
import { summarizeGovernmentScheme } from './summarize-government-scheme';
import { textToSpeech } from './text-to-speech';
import {
  DiagnoseCropDiseaseOutputSchema,
  GetMandiPriceInsightsOutputSchema,
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
    description: 'Use this tool ONLY when the user provides an image of a plant. This tool analyzes the image to diagnose crop diseases.',
    inputSchema: z.object({
        query: z.string(),
        photoDataUri: z.string(),
        targetLanguage: z.string(),
    }),
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async (input) => diagnoseCropDisease(input)
);

const mandiPriceTool = ai.defineTool(
  {
    name: 'getMandiPriceInsights',
    description: 'Gets mandi price insights for a specific crop and location.',
    inputSchema: z.object({
        crop: z.string(),
        location: z.string(),
        targetLanguage: z.string(),
    }),
    outputSchema: GetMandiPriceInsightsOutputSchema,
  },
  async (input) => getMandiPriceInsights(input)
);

const govSchemeTool = ai.defineTool(
  {
    name: 'summarizeGovernmentScheme',
    description: 'Summarizes a government scheme for a farmer based on their query.',
    inputSchema: z.object({
        schemeName: z.string().describe("The name of the scheme, extracted from the user's query."),
        query: z.string().describe("The user's full question about the scheme."),
        targetLanguage: z.string(),
    }),
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
Your goal is to understand the user's question and use the available tools to provide a clear and concise answer.
- If the user provides an image, you MUST use the 'diagnoseCropDisease' tool. Pass the user's text query, the image data, and the target language to the tool.
- For mandi prices, use the getMandiPriceInsights tool. The user's location is provided in the input. Extract the crop name from the query.
- For government schemes, use the summarizeGovernmentScheme tool. Extract the scheme name from the query.
- If the user asks a general question or something you don't have a tool for, provide a helpful answer based on your general knowledge.
- Always be polite and address the farmer directly.
- The user's current location is: {{location}}. Use this for any location-based queries unless they specify a different one.
- The user's preferred language is {{targetLanguage}}. Your final answer must be in this language. The tools will handle their own translation, but if you answer directly, you must translate it yourself.`,
});

const khetAIAgentFlow = ai.defineFlow(
  {
    name: 'khetAIAgentFlow',
    inputSchema: KhetAIAgentInputSchema,
    outputSchema: KhetAIAgentOutputSchema,
  },
  async (input) => {
    const promptPayload = input.photoDataUri
      ? [{ text: input.query }, { media: { url: input.photoDataUri } }]
      : input.query;

    const llmResponse = await prompt(promptPayload);
    const llmOutput = llmResponse.output();

    if (!llmOutput) {
       return {
        response: "I'm sorry, I couldn't find an answer to your question. Please try rephrasing it.",
      };
    }
    
    let responseText: string | undefined;

    if (llmOutput.toolCalls?.length) {
        const toolResponse = await llmResponse.toolRequest?.responses();
        const toolOutput = toolResponse?.[0]?.output;
        if(toolOutput){
            responseText = (toolOutput as any).diagnosis || (toolOutput as any).summary || JSON.stringify(toolOutput);
        }
    } else {
        responseText = llmOutput.text;
    }
    
    if (!responseText) {
       responseText = "I'm sorry, I couldn't find an answer to your question. Please try rephrasing it.";
    }

    // Translate the response to the user's preferred language
    const translatedResponse = await translateText({ text: responseText, targetLanguage: input.targetLanguage });
    
    // Convert the translated text to speech
    const speech = await textToSpeech({ text: translatedResponse.translatedText });

    return {
      response: translatedResponse.translatedText,
      audio: speech.audio,
    };
  }
);

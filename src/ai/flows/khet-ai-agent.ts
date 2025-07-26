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
  DiagnoseCropDiseaseInput,
  DiagnoseCropDiseaseInputSchema,
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
    description: 'Use this tool ONLY when the user provides an image of a plant. This tool analyzes the image to diagnose crop diseases.',
    inputSchema: DiagnoseCropDiseaseInputSchema,
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
Your goal is to understand the user's question and use the available tools to provide a clear and concise answer.
- If the user provides an image, you MUST use the 'diagnoseCropDisease' tool. Pass BOTH the user's text query and the image data to the tool.
- For mandi prices, use the getMandiPriceInsights tool. The user's location is provided in the input.
- For government schemes, use the summarizeGovernmentScheme tool.
- If the user asks a general question or something you don't have a tool for, provide a helpful answer based on your general knowledge.
- Always be polite and address the farmer directly.
- The user's current location is: {{location}}. Use this for any location-based queries unless they specify a different one.
- The user's preferred language is {{targetLanguage}}. The tools will handle their own translation, but your own conversational text must be translated at the end.`,
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
        
        // The context for tools is inferred from the flow's input schema.
        // We pass the full input object to the prompt call.
        const {output} = await prompt(input);
        
        const responseText = output?.content?.parts.map((p: { text?: string; toolResponse?: { name: string, output: any } }) => {
            if (p.text) return p.text;
            if (p.toolResponse) {
                // Extract the relevant summary/diagnosis from the tool's output object
                if (p.toolResponse.name === 'diagnoseCropDisease') return p.toolResponse.output.diagnosis;
                if (p.toolResponse.name === 'getMandiPriceInsights') return p.toolResponse.output.summary;
                if (p.toolResponse.name === 'summarizeGovernmentScheme') return p.toolResponse.output.summary;
            }
            return '';
        }).join('\n').trim() || "I'm sorry, I couldn't find an answer to your question. Please try rephrasing it.";
        
        const translatedResponse = await translateText({ text: responseText, targetLanguage: input.targetLanguage });
        const speech = await textToSpeech({text: translatedResponse.translatedText});

        return {
          response: translatedResponse.translatedText,
          audio: speech.audio,
        };
    }
);

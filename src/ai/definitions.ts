/**
 * @fileOverview Centralized definitions for AI flow schemas and types.
 *
 * This file contains all the Zod schemas and TypeScript type definitions
 * used by the Genkit flows. It does not contain any server-side logic
 * and can be safely imported by both server and client components.
 */

import { z } from 'zod';

// =============================================
// Diagnose Crop Disease
// =============================================
export const DiagnoseCropDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  query: z.string().describe('The user\'s question about the crop.'),
  targetLanguage: z.string().describe('The language to translate the response to (e.g., "hi", "en").'),
});
export type DiagnoseCropDiseaseInput = z.infer<typeof DiagnoseCropDiseaseInputSchema>;

export const DiagnoseCropDiseaseOutputSchema = z.object({
  diagnosis: z.string().describe('The diagnosis of the crop disease.'),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;


// =============================================
// Get Mandi Price Insights
// =============================================
export const GetMandiPriceInsightsInputSchema = z.object({
  crop: z.string().describe('The crop to get mandi price insights for.'),
  location: z.string().describe('The location (e.g., city, district) to get mandi price insights for.'),
  targetLanguage: z.string().describe('The language to translate the response to (e.g., "hi", "en").'),
});
export type GetMandiPriceInsightsInput = z.infer<typeof GetMandiPriceInsightsInputSchema>;

export const GetMandiPriceInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of recent mandi price trends for the specified crop and location.'),
});
export type GetMandiPriceInsightsOutput = z.infer<typeof GetMandiPriceInsightsOutputSchema>;


// =============================================
// Summarize Government Scheme
// =============================================
export const SummarizeGovernmentSchemeInputSchema = z.object({
  schemeName: z.string().describe('The name of the government scheme to summarize.'),
  query: z.string().describe('The query about the government scheme.'),
  targetLanguage: z.string().describe('The language to translate the response to (e.g., "hi", "en").'),
});
export type SummarizeGovernmentSchemeInput = z.infer<typeof SummarizeGovernmentSchemeInputSchema>;

export const SummarizeGovernmentSchemeOutputSchema = z.object({
  summary: z.string().describe('A simplified summary of the government scheme.'),
});
export type SummarizeGovernmentSchemeOutput = z.infer<typeof SummarizeGovernmentSchemeOutputSchema>;


// =============================================
// KhetAI Agent
// =============================================
export const KhetAIAgentInputSchema = z.object({
  query: z.string().describe("The user's query."),
  location: z.string().describe("The user's location (e.g., city, district)."),
  targetLanguage: z.string().describe('The language to translate the response to (e.g., "hi", "en").'),
  photoDataUri: z.string().optional().describe("An optional photo of a crop, as a data URI."),
});
export type KhetAIAgentInput = z.infer<typeof KhetAIAgentInputSchema>;

export const KhetAIAgentOutputSchema = z.object({
  response: z.string().describe("The agent's response to the user's query."),
  audio: z.string().optional().describe("The base64 encoded audio data URI for the response."),
});
export type KhetAIAgentOutput = z.infer<typeof KhetAIAgentOutputSchema>;


// =============================================
// Translate Text
// =============================================
export const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "Hindi", "en", "es").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

export const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;


// =============================================
// Text to Speech
// =============================================
export const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

export const TextToSpeechOutputSchema = z.object({
  audio: z.string().describe("A data URI of the generated audio file. Expected format: 'data:audio/wav;base64,<encoded_data>'."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

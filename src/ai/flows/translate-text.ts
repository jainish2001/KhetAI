'use server';
/**
 * @fileOverview A Genkit flow for translating text.
 *
 * This file defines a flow that translates a given text to a target language
 * using an AI model.
 *
 * - translateText - A function that handles the text translation process.
 */

import { ai } from '@/ai/genkit';
import {
  TranslateTextInput,
  TranslateTextInputSchema,
  TranslateTextOutput,
  TranslateTextOutputSchema
} from '@/ai/definitions';


export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  // If the target language is English, no need to translate.
  if (input.targetLanguage.toLowerCase() === 'en') {
    return { translatedText: input.text };
  }

  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { schema: TranslateTextInputSchema },
  output: { schema: TranslateTextOutputSchema },
  prompt: `Translate the following text to {{targetLanguage}}.

Text:
"{{text}}"

Return only the translated text, with no additional explanation or context.`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

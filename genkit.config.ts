import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { vertexAI } from '@genkit-ai/vertexai';

export default genkit({
  plugins: [
    googleAI(),
    vertexAI({
      location: 'us-central1',
    }),
  ],
});

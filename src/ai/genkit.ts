import {genkit, configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

configureGenkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const ai = genkit({
  plugins: [googleAI()],
});

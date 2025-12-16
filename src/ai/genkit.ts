
/**
 * @fileoverview This file initializes the Genkit AI singleton. It should be
 * imported by all other files that need to use Genkit.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// In a real app, you would load this from a secret store.
// See https://firebase.google.com/docs/functions/config-env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error(
    'GEMINI_API_KEY environment variable not set. ' +
      'See https://ai.google.dev/tutorials/setup to get an API key.'
  );
}

// Initialize Genkit with the Google AI plugin.
export const ai = genkit({
  plugins: [googleAI({apiKey: GEMINI_API_KEY})],
  // Production-friendly settings: removed logLevel and traceStore
});

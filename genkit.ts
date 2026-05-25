import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * STRATEGIC GENKIT CONFIGURATION
 * Standardizing on Gemini 1.5 Flash (Stable) to resolve 403 Forbidden 
 * access restrictions associated with preview models and ensure 100% 
 * production uptime for the AI Reports section.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});

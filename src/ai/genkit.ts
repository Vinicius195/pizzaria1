import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import 'dotenv/config';

const googleApiKey = process.env.GOOGLE_API_KEY;

if (!googleApiKey || googleApiKey.includes('YOUR_GOOGLE_API_KEY')) {
    console.warn("GOOGLE_API_KEY is not set or is a placeholder. AI features will be disabled. Please check your .env file.");
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: googleApiKey,
    }),
  ],
  model: 'googleai/gemini-1.5-flash-latest',
});

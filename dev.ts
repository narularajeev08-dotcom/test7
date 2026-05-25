
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-charter-summary-flow.ts';
import '@/ai/flows/restructure-legacy-charter-flow.ts';
import '@/ai/flows/query-charters-flow.ts';
import '@/ai/flows/refine-network-notes-flow.ts';

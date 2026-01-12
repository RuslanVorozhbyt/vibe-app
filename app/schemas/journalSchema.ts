import { z } from 'zod';

export const journalSchema = z.object({
  mood: z.string(),
  stress_level: z.number(),
  topic: z.string(),
  summary: z.string(),
  advice: z.string(),
});

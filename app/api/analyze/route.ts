import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";
import {journalSchema} from "@/app/schemas/journalSchema";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { text } = await req.json();

  const result = await streamObject({
    model: openai("gpt-4o-mini"),
    schema: journalSchema,
    prompt: `Analyze this journal entry and return an object describing the user's emotional state. Entry: "${text}"`,
  });

  return result.toTextStreamResponse();
}

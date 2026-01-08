import { NextResponse } from "next/server";
import { streamObject } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { text } = await req.json();

  const { partialObjectStream } = streamObject({
    model: openai("gpt-4o-mini"),
    schema: {
      type: "object",
      properties: {
        mood: { type: "string" },
        stress_level: { type: "number" },
        topic: { type: "string" },
        summary: { type: "string" },
        advice: { type: "string" },
      },
    },
    prompt: `
      Analyze this journal entry and return an object describing the user's emotional state.
      Entry: "${text}"
    `,
  });

  const chunks = [];
  for await (const part of partialObjectStream) chunks.push(part);

  return NextResponse.json(chunks[chunks.length - 1]);
}

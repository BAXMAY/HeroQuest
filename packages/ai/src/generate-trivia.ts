import { z } from "zod";
import type { Locale } from "@heroquest/db/types";
import { getAnthropic, MODEL_FAST, type AnthropicEnv } from "./client";
import { buildGenerateTriviaSystem, type PromptBrand } from "./prompts";

const TRIVIA_TOPICS = [
  "kindness",
  "honesty",
  "helping",
  "animals",
  "environment",
  "health",
  "sharing",
  "courage",
  "friendship",
  "learning",
  "gratitude",
] as const;

const triviaItemSchema = z.object({
  question: z.string().min(5).max(280),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(5).max(280),
  difficulty: z.enum(["easy", "medium"]),
  topic: z.enum(TRIVIA_TOPICS),
});

const triviaResponseSchema = z.array(triviaItemSchema).min(1).max(10);

export type TriviaItem = z.infer<typeof triviaItemSchema>;

export type GenerateTriviaInput = {
  locale: Locale;
  count?: number; // default 5
  brand?: PromptBrand;
};

export async function generateDailyTrivia(
  env: AnthropicEnv,
  input: GenerateTriviaInput,
): Promise<TriviaItem[]> {
  const anthropic = getAnthropic(env);
  const count = input.count ?? 5;
  const systemPrompt = buildGenerateTriviaSystem(input.brand);

  const response = await anthropic.messages.create({
    model: MODEL_FAST,
    max_tokens: 1500,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Generate ${count} unique trivia questions for locale "${input.locale}". Mix easy and medium difficulty. Cover varied topics. Respond with a JSON array only.`,
      },
    ],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n")
    .trim();

  const stripped = stripJsonFences(text);
  return triviaResponseSchema.parse(JSON.parse(stripped));
}

function stripJsonFences(text: string): string {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return (m?.[1] ?? text).trim();
}

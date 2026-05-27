import { z } from "zod";
import { QUEST_CATEGORIES, type Locale } from "@heroquest/db/types";
import { getAnthropic, MODEL_FAST, type AnthropicEnv } from "./client";
import { SUGGEST_OPPORTUNITIES_SYSTEM } from "./prompts";

const opportunitySchema = z.object({
  title: z.string().min(3).max(80),
  description: z.string().min(5).max(280),
  category: z.enum(QUEST_CATEGORIES),
});

const responseSchema = z.array(opportunitySchema).min(1).max(8);

export type Opportunity = z.infer<typeof opportunitySchema>;

export type SuggestOpportunitiesInput = {
  age: number;
  locale: Locale;
  interests?: string[];
  count?: number;
};

export async function suggestOpportunities(
  env: AnthropicEnv,
  input: SuggestOpportunitiesInput,
): Promise<Opportunity[]> {
  const anthropic = getAnthropic(env);
  const count = input.count ?? 4;
  const interestsLine = input.interests?.length
    ? `Interests: ${input.interests.join(", ")}.`
    : "Interests: not specified — give a varied mix.";

  const response = await anthropic.messages.create({
    model: MODEL_FAST,
    max_tokens: 700,
    system: [
      {
        type: "text",
        text: SUGGEST_OPPORTUNITIES_SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Age: ${input.age}.\nLocale: ${input.locale}.\n${interestsLine}\nSuggest ${count} good deeds.`,
      },
    ],
  });

  const text = response.content
    .filter((b): b is { type: "text"; text: string } => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  const stripped = (text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)?.[1] ?? text).trim();
  return responseSchema.parse(JSON.parse(stripped));
}

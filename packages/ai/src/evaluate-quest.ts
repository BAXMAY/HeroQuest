import { z } from "zod";
import type { Locale } from "@heroquest/db/types";
import { getAnthropic, MODEL_FAST, type AnthropicEnv } from "./client";
import { EVAL_QUEST_SYSTEM } from "./prompts";

const evaluationSchema = z.object({
  xp: z.number().int().min(0).max(200),
  coins: z.number().int().min(0).max(25),
  justification: z.string().min(1).max(280),
});

export type QuestEvaluation = z.infer<typeof evaluationSchema>;

export type EvaluateQuestInput = {
  description: string;
  /** Presigned R2 URL — must be reachable for the lifetime of this call. */
  photoUrl: string;
  locale: Locale;
};

/**
 * Ask Claude to suggest XP/coins for a child's submitted quest.
 *
 * Uses prompt caching on the system message — when an admin auto-pilots a
 * batch of approvals, the system tokens are cached after the first call and
 * subsequent calls within ~5 min cost ~10% of normal input pricing.
 */
export async function evaluateQuest(
  env: AnthropicEnv,
  input: EvaluateQuestInput,
): Promise<QuestEvaluation> {
  const anthropic = getAnthropic(env);

  const messageRequest = (instructionSuffix?: string) =>
    anthropic.messages.create({
      model: MODEL_FAST,
      max_tokens: 256,
      system: [
        {
          type: "text",
          text: EVAL_QUEST_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "url", url: input.photoUrl },
            },
            {
              type: "text",
              text:
                `Locale: ${input.locale}\n` +
                `Description: ${input.description}\n\n` +
                `Respond as JSON only matching {"xp":number,"coins":number,"justification":string}.` +
                (instructionSuffix ? `\n\n${instructionSuffix}` : ""),
            },
          ],
        },
      ],
    });

  const parseResponse = (text: string): QuestEvaluation =>
    evaluationSchema.parse(JSON.parse(stripJsonFences(text)));

  const first = await messageRequest();
  const firstText = extractText(first);
  try {
    return parseResponse(firstText);
  } catch {
    // One retry with an explicit "JSON only" reminder.
    const second = await messageRequest("Your previous response was not valid JSON. Reply with JSON only — no markdown, no prose.");
    const secondText = extractText(second);
    return parseResponse(secondText);
  }
}

function extractText(msg: { content: Array<{ type: string; text?: string }> }): string {
  return msg.content
    .filter((b): b is { type: "text"; text: string } => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

function stripJsonFences(text: string): string {
  // Models occasionally wrap JSON in ```json … ``` despite instructions.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return (fenceMatch?.[1] ?? text).trim();
}

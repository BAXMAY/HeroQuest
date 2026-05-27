import Anthropic from "@anthropic-ai/sdk";

/**
 * Model presets used across the app.
 *
 * Defaults track the latest Claude family at the time of writing.
 * Override per-call by passing `model:` when needed.
 */
export const MODEL_FAST = "claude-haiku-4-5";
export const MODEL_RICH = "claude-opus-4-7";

export type AnthropicEnv = {
  ANTHROPIC_API_KEY: string;
};

/**
 * Construct an Anthropic client from the Workers `env`.
 * Workers' global `fetch` is used implicitly by the SDK.
 */
export function getAnthropic(env: AnthropicEnv): Anthropic {
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

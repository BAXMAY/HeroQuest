'use server';
/**
 * @fileOverview An AI agent that evaluates a submitted quest and suggests XP and coin rewards.
 *
 * - evaluateQuest - A function that handles the quest evaluation.
 * - EvaluateQuestInput - The input type for the evaluateQuest function.
 * - EvaluateQuestOutput - The return type for the evaluateQuest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateQuestInputSchema = z.object({
  description: z.string().describe('The description of the good deed or quest submitted by the user.'),
  photoDataUri: z
    .string()
    .describe(
      "A photo of the completed quest, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EvaluateQuestInput = z.infer<typeof EvaluateQuestInputSchema>;

const EvaluateQuestOutputSchema = z.object({
  points: z.number().describe('The suggested Experience Points (XP) to award for this quest. Should be between 10 and 200.'),
  coins: z.number().describe('The suggested Brave Coins to award for this quest. Usually around 10% of the points.'),
  justification: z.string().describe('A brief, one-sentence explanation for the suggested reward, to be shown to the admin.'),
});
export type EvaluateQuestOutput = z.infer<typeof EvaluateQuestOutputSchema>;

export async function evaluateQuest(input: EvaluateQuestInput): Promise<EvaluateQuestOutput> {
  return evaluateQuestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateQuestPrompt',
  input: {schema: EvaluateQuestInputSchema},
  output: {schema: EvaluateQuestOutputSchema},
  prompt: `You are an AI judge for a children's game called "HeroQuest" where kids complete real-world good deeds (quests). Your role is to evaluate a submitted quest and suggest a fair reward in Experience Points (XP) and Brave Coins.

  **Evaluation Guidelines:**
  - **Base Points:** A simple, standard quest is worth around 50 XP.
  - **Effort & Impact:** Award more points for quests that require more effort, time, or have a bigger positive impact. A difficult quest could be worth up to 200 XP. A very simple one might be 10-30 XP.
  - **Creativity:** Give bonus points for creative or thoughtful quests.
  - **Brave Coins:** Coins should be approximately 10% of the XP awarded, rounded to the nearest whole number.
  - **Justification:** Provide a short, one-sentence justification for your reward suggestion.

  **Quest to Evaluate:**
  - **Description:** {{{description}}}
  - **Photo Evidence:** {{media url=photoDataUri}}

  Based on the description and photo, evaluate the quest and provide your suggested reward in the specified JSON format.`,
});

const evaluateQuestFlow = ai.defineFlow(
  {
    name: 'evaluateQuestFlow',
    inputSchema: EvaluateQuestInputSchema,
    outputSchema: EvaluateQuestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

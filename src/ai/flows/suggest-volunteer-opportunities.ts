'use server';

/**
 * @fileOverview An AI agent that suggests relevant volunteer opportunities based on trending submissions of good deeds.
 *
 * - suggestVolunteerOpportunities - A function that suggests volunteer opportunities.
 * - SuggestVolunteerOpportunitiesInput - The input type for the suggestVolunteerOpportunities function.
 * - SuggestVolunteerOpportunitiesOutput - The return type for the suggestVolunteerOpportunities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestVolunteerOpportunitiesInputSchema = z.object({
  trendingDeeds: z.array(
    z.object({
      description: z.string().describe('Description of the good deed.'),
      category: z.string().describe('Category of the good deed.'),
    })
  ).describe('A list of trending good deeds with descriptions and categories.'),
  interests: z.array(z.string()).optional().describe('A list of the user interests.')
});
export type SuggestVolunteerOpportunitiesInput = z.infer<typeof SuggestVolunteerOpportunitiesInputSchema>;

const SuggestVolunteerOpportunitiesOutputSchema = z.object({
  opportunities: z.array(
    z.object({
      title: z.string().describe('Title of the volunteer opportunity.'),
      description: z.string().describe('Description of the volunteer opportunity.'),
      category: z.string().describe('Category of the volunteer opportunity.'),
    })
  ).describe('A list of suggested volunteer opportunities.'),
});
export type SuggestVolunteerOpportunitiesOutput = z.infer<typeof SuggestVolunteerOpportunitiesOutputSchema>;

export async function suggestVolunteerOpportunities(input: SuggestVolunteerOpportunitiesInput): Promise<SuggestVolunteerOpportunitiesOutput> {
  return suggestVolunteerOpportunitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestVolunteerOpportunitiesPrompt',
  input: {schema: SuggestVolunteerOpportunitiesInputSchema},
  output: {schema: SuggestVolunteerOpportunitiesOutputSchema},
  prompt: `You are a helpful AI assistant that suggests volunteer opportunities to children based on trending good deeds in their community and their specific interests.

Trending Good Deeds:
{{#each trendingDeeds}}
- Category: {{category}}, Description: {{description}}
{{/each}}

{{#if interests}}
User Interests:
{{#each interests}}
- {{this}}
{{/each}}
{{/if}}

Suggest volunteer opportunities that are relevant to these trending deeds and align with the user's interests, if provided. Each opportunity should have a title, description and a category.

Format your response as a JSON object that adheres to the following schema:
${JSON.stringify(SuggestVolunteerOpportunitiesOutputSchema.describe('schema')._def)}`,
});

const suggestVolunteerOpportunitiesFlow = ai.defineFlow(
  {
    name: 'suggestVolunteerOpportunitiesFlow',
    inputSchema: SuggestVolunteerOpportunitiesInputSchema,
    outputSchema: SuggestVolunteerOpportunitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

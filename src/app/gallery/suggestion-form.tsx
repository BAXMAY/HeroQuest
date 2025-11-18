'use client';
import { useState } from 'react';
import { suggestVolunteerOpportunities, SuggestVolunteerOpportunitiesOutput } from '@/ai/flows/suggest-volunteer-opportunities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';
import OpportunityCard from './opportunity-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const interestOptions = ["Animals", "Environment", "Community", "Education", "Health"];

interface SuggestionFormProps {
  trendingDeeds: {
    description: string;
    category: string;
  }[];
}

export default function SuggestionForm({ trendingDeeds }: SuggestionFormProps) {
  const [interests, setInterests] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestVolunteerOpportunitiesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInterestChange = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);
    try {
      const result = await suggestVolunteerOpportunities({
        trendingDeeds: trendingDeeds.slice(0, 5), // Use a subset of trending deeds
        interests,
      });
      setSuggestions(result);
    } catch (e) {
      setError('Sorry, the AI is taking a quick break. Please try again in a moment.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Find Your Next Good Deed</CardTitle>
          <CardDescription>Tell us what you care about, and our AI will find volunteer ideas for you!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="font-semibold">What are you interested in?</Label>
            <div className="flex flex-wrap gap-4">
              {interestOptions.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={interest}
                    checked={interests.includes(interest.toLowerCase())}
                    onCheckedChange={() => handleInterestChange(interest.toLowerCase())}
                  />
                  <Label htmlFor={interest} className="font-normal">
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Get Suggestions
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
         <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin"/>
            <span>Our AI is thinking...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
            <AlertTitle>Oops!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {suggestions && (
        <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">Here are some ideas!</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.opportunities.map((opp, index) => (
              <OpportunityCard key={index} opportunity={opp} />
            ))}
            </div>
        </div>
      )}
    </div>
  );
}

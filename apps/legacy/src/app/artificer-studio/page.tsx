'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Paintbrush, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '../context/language-context';
import Image from 'next/image';
import { generateImage, GenerateImageOutput } from '@/ai/flows/generate-image-flow';

export default function ArtificerStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [generation, setGeneration] = useState<GenerateImageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleSubmit = async () => {
    if (!prompt) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneration(null);
    try {
      const result = await generateImage({ prompt });
      setGeneration(result);
    } catch (e) {
      setError('The Artificer is busy. Please try again in a moment.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Paintbrush className="w-8 h-8 text-accent"/>
            Artificer's Studio
        </h1>
        <p className="text-muted-foreground">Bring your imagination to life! Describe what you want to create.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a Masterpiece</CardTitle>
          <CardDescription>Use your words to paint a picture. What will you create?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt-input" className="font-semibold">Your Vision</Label>
            <Input
              id="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A friendly dragon reading a book in a cozy cave"
            />
          </div>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Forge Image
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
         <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin"/>
            <span>The Artificer is forging your vision...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
            <AlertTitle>Oops!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {generation && (
        <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">Your Creation!</h2>
            <div className="relative aspect-square w-full max-w-lg mx-auto overflow-hidden rounded-lg border shadow-lg">
                <Image src={generation.imageUrl} alt={prompt} fill className="object-contain" />
            </div>
            <div className="mt-4 text-center">
              <Button asChild>
                <a href={generation.imageUrl} download={`heroquest-creation-${Date.now()}.png`}>
                  Download Image
                </a>
              </Button>
            </div>
        </div>
      )}
    </div>
  );
}

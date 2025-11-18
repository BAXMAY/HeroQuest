'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { rewards as initialRewards, currentUser } from '@/app/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Coins, ShoppingBag, Sparkles } from 'lucide-react';
import type { Reward } from '@/app/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RewardsPage() {
  const [braveCoins, setBraveCoins] = useState(currentUser.braveCoins);
  const { toast } = useToast();

  const handleRedeem = (reward: Reward) => {
    if (braveCoins >= reward.cost) {
      setBraveCoins((prev) => prev - reward.cost);
      toast({
        title: 'Reward Redeemed!',
        description: `You've successfully claimed the "${reward.name}".`,
      });
    } else {
      toast({
        title: 'Not enough coins!',
        description: 'Complete more quests to earn enough Brave Coins.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-accent" />
            Reward Shop
          </h1>
          <p className="text-muted-foreground">Spend your Brave Coins on legendary loot!</p>
        </div>
        <Card className="w-full sm:w-auto">
            <CardHeader className="flex flex-row items-center justify-between p-4 space-y-0">
                <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
                 <div className="text-2xl font-bold text-amber-500">{braveCoins}</div>
            </CardContent>
        </Card>
      </div>

      {initialRewards.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {initialRewards.map((reward) => {
            const canAfford = braveCoins >= reward.cost;

            return (
              <Card key={reward.id} className="flex flex-col overflow-hidden">
                <div className="relative w-full h-40">
                  <Image 
                    src={reward.image} 
                    alt={reward.name} 
                    fill 
                    className="object-cover"
                    data-ai-hint="reward item"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg leading-tight">{reward.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{reward.description}</CardDescription>
                </CardContent>
                <CardFooter className="flex-col items-stretch space-y-2">
                    <div className="flex items-center justify-center gap-2 font-bold text-lg text-amber-500">
                        <Coins className="w-5 h-5"/>
                        <span>{reward.cost}</span>
                    </div>
                  <Button onClick={() => handleRedeem(reward)} disabled={!canAfford}>
                    {canAfford ? 'Redeem' : 'Not Enough Coins'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertTitle>No Rewards Yet!</AlertTitle>
          <AlertDescription>
            The quartermaster is still stocking the shop. Check back soon for new rewards!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

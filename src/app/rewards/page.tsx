'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Coins, ShoppingBag, Sparkles, Loader2 } from 'lucide-react';
import type { Reward, UserProfile } from '@/app/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDoc, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { increment } from 'firebase/firestore';
import { useLanguage } from '../context/language-context';

export default function RewardsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t } = useLanguage();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const rewardsCollectionRef = useMemoFirebase(() => collection(firestore, 'rewards'), [firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  const { data: rewards, isLoading: isLoadingRewards } = useCollection<Reward>(rewardsCollectionRef);

  const handleRedeem = (reward: Reward) => {
    if (!userProfile || !userProfileRef) return;

    if (userProfile.braveCoins >= reward.cost) {
      updateDocumentNonBlocking(userProfileRef, {
        braveCoins: increment(-reward.cost)
      });

      toast({
        title: t('rewardRedeemed'),
        description: t('rewardRedeemedDescription', { rewardName: reward.name }),
      });
    } else {
      toast({
        title: t('notEnoughCoinsToast'),
        description: t('notEnoughCoinsDescription'),
        variant: 'destructive',
      });
    }
  };
  
  const isLoading = isUserLoading || isProfileLoading || isLoadingRewards;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-accent" />
            {t('pageTitles.rewards')}
          </h1>
          <p className="text-muted-foreground">{t('rewardsDescription')}</p>
        </div>
        {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
            <Card className="w-full sm:w-auto">
                <CardHeader className="flex flex-row items-center justify-between p-4 space-y-0">
                    <CardTitle className="text-sm font-medium">{t('yourBalance')}</CardTitle>
                    <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                     <div className="text-2xl font-bold text-amber-500">{(userProfile?.braveCoins || 0).toLocaleString()}</div>
                </CardContent>
            </Card>
        )}
      </div>

      {rewards && rewards.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rewards.map((reward) => {
            const canAfford = (userProfile?.braveCoins || 0) >= reward.cost;

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
                  <Button onClick={() => handleRedeem(reward)} disabled={!canAfford || isLoading}>
                    {canAfford ? t('redeem') : t('notEnoughCoins')}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertTitle>{t('noRewardsYet')}</AlertTitle>
          <AlertDescription>
            {t('noRewardsDescription')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

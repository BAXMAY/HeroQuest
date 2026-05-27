'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Coins, ShoppingBag, Sparkles, Loader2, CheckCircle, Gift, Truck } from 'lucide-react';
import type { Reward, UserProfile, RedeemedReward } from '@/app/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
  updateDocumentNonBlocking,
  useCollection,
  addDocumentNonBlocking,
} from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { increment } from 'firebase/firestore';
import { useLanguage } from '../context/language-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function RewardsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t } = useLanguage();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const rewardsCollectionRef = useMemoFirebase(
    () => collection(firestore, 'rewards'),
    [firestore]
  );
  
  const redeemedRewardsCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'redeemed_rewards');
  }, [user, firestore]);


  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userProfileRef);
  const { data: rewards, isLoading: isLoadingRewards } =
    useCollection<Reward>(rewardsCollectionRef);
  const { data: redeemedRewards, isLoading: isLoadingRedeemed } = useCollection<RedeemedReward>(redeemedRewardsCollectionRef);

  const handleRedeem = (reward: Reward) => {
    if (!userProfile || !userProfileRef || !redeemedRewardsCollectionRef) return;

    if (userProfile.braveCoins >= reward.cost) {
      // 1. Decrement user's coins
      updateDocumentNonBlocking(userProfileRef, {
        braveCoins: increment(-reward.cost),
      });

      // 2. Add to redeemed_rewards subcollection
      const newRedeemedReward = {
        rewardId: reward.id,
        name: reward.name,
        cost: reward.cost,
        image: reward.image,
        redeemedAt: serverTimestamp(),
        status: 'processing',
      };
      addDocumentNonBlocking(redeemedRewardsCollectionRef, newRedeemedReward);


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

  const isLoading = isUserLoading || isProfileLoading || isLoadingRewards || isLoadingRedeemed;
  const redeemedRewardIds = new Set(redeemedRewards?.map(r => r.rewardId));

  const getStatusIcon = (status: RedeemedReward['status']) => {
    switch (status) {
        case 'processing': return <Loader2 className="w-3 h-3 mr-1 animate-spin" />;
        case 'shipped': return <Truck className="w-3 h-3 mr-1" />;
        case 'delivered': return <CheckCircle className="w-3 h-3 mr-1" />;
        default: return null;
    }
  };

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
              <div className="text-2xl font-bold text-amber-500">
                {(userProfile?.braveCoins || 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Tabs defaultValue="shop">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shop">Reward Shop</TabsTrigger>
            <TabsTrigger value="redeemed">My Rewards ({redeemedRewards?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="shop">
            {rewards && rewards.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
                {rewards.map((reward) => {
                    const canAfford = (userProfile?.braveCoins || 0) >= reward.cost;
                    const isRedeemed = redeemedRewardIds.has(reward.id);

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
                            <Coins className="w-5 h-5" />
                            <span>{reward.cost}</span>
                        </div>
                        {isRedeemed ? (
                            <Button disabled variant="outline" className="w-full">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Redeemed
                            </Button>
                        ) : (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <Button disabled={!canAfford || isLoading} className="w-full">
                                    {canAfford ? t('redeem') : t('notEnoughCoins')}
                                </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Redemption</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    Are you sure you want to spend {reward.cost} Brave Coins to redeem the "{reward.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRedeem(reward)}>
                                    Confirm
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        </CardFooter>
                    </Card>
                    );
                })}
                </div>
            ) : (
                <Alert className="mt-6">
                <Sparkles className="h-4 w-4" />
                <AlertTitle>{t('noRewardsYet')}</AlertTitle>
                <AlertDescription>{t('noRewardsDescription')}</AlertDescription>
                </Alert>
            )}
        </TabsContent>
         <TabsContent value="redeemed">
            {redeemedRewards && redeemedRewards.length > 0 ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
                    {redeemedRewards.map((reward) => (
                         <Card key={reward.id} className="flex flex-col overflow-hidden bg-secondary/30">
                            <div className="relative w-full h-40 opacity-80">
                                <Image
                                    src={reward.image}
                                    alt={reward.name}
                                    fill
                                    className="object-cover"
                                    data-ai-hint="reward item"
                                />
                                <Badge className={cn("absolute top-2 right-2 capitalize", {
                                  'bg-blue-500': reward.status === 'processing',
                                  'bg-orange-500': reward.status === 'shipped',
                                  'bg-green-500': reward.status === 'delivered',
                                })}>
                                    {getStatusIcon(reward.status)}
                                    {reward.status}
                                </Badge>
                            </div>
                            <CardHeader>
                                <CardTitle className="text-lg leading-tight">{reward.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Redeemed on {reward.redeemedAt?.toDate().toLocaleDateString()}</p>
                            </CardContent>
                            <CardFooter>
                                 <Button disabled variant="outline" className="w-full">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    In Your Collection
                                </Button>
                            </CardFooter>
                         </Card>
                    ))}
                </div>
            ) : (
                <Alert className="mt-6">
                    <Gift className="h-4 w-4" />
                    <AlertTitle>No Rewards Redeemed</AlertTitle>
                    <AlertDescription>You haven't redeemed any rewards yet. Visit the shop to spend your Brave Coins!</AlertDescription>
                </Alert>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

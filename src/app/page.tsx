'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deeds } from "@/app/lib/mock-data";
import { ArrowUpRight, Award, PlusCircle, Coins, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Mascot from "@/app/components/mascot";
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { useLanguage } from "@/app/context/language-context";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { t } = useLanguage();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const userDeeds = deeds
    .filter((deed) => deed.userId === user?.uid && deed.status === "approved")
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 3);
  
  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }
  
  const displayName = userProfile?.firstName || user?.displayName || t('adventurer');

  return (
    <div className="space-y-8">
       <div className="flex items-center gap-4 p-6 rounded-lg border-2 border-primary/30 bg-primary/5">
        <Mascot className="w-16 h-16 text-primary flex-shrink-0 hidden sm:block" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-headline text-primary/90">
            {t('greeting', { displayName })}
          </h1>
          <p className="text-muted-foreground">
            {t('readyForQuest')}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-card to-secondary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('experiencePoints')}</CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-primary font-headline">
              {(userProfile?.totalPoints || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('totalExperience')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t('braveCoins')}</CardTitle>
            <Coins className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-amber-500 font-headline">
              {(userProfile?.braveCoins || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('yourTreasure')}
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center bg-accent/20 border-accent/50 border-dashed">
          <CardHeader>
            <CardTitle>{t('logNewQuest')}</CardTitle>
            <CardDescription>{t('everyDeedBetter')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/submit">
                <PlusCircle className="w-5 h-5 mr-2" />
                {t('startAQuest')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">
          {t('yourCompletedQuests')}
        </h2>
        {userDeeds.length > 0 ? (
          <div className="space-y-4">
            {userDeeds.map((deed) => (
              <Card key={deed.id} className="overflow-hidden">
                <div className="flex">
                  <div className="w-1/3 h-auto relative">
                     <Image
                      src={deed.photo}
                      alt={deed.description}
                      fill
                      className="object-cover"
                      data-ai-hint="volunteer children"
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="mb-2 capitalize">{deed.category}</Badge>
                      <p className="text-sm text-muted-foreground font-medium">
                        +{deed.points} {t('xp')}
                      </p>
                    </div>
                    <p className="font-semibold">{deed.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('completedOn', { date: new Date(deed.submittedAt).toLocaleDateString() })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
             <Button variant="link" asChild className="p-0 h-auto">
              <Link href="#" className="text-sm font-semibold">
                {t('viewQuestLog')} <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">{t('noQuestsYet')} <Link href="/submit" className="text-primary underline">{t('startYourFirst')}</Link></p>
        )}
      </div>
    </div>
  );
}

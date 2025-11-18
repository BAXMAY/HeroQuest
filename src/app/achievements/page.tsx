'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { allAchievements } from '@/app/lib/mock-data';
import { Shield, Trophy, CheckCircle2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Achievement } from '@/app/lib/types';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function AchievementsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userAchievementsRef = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, 'users', user.uid, 'achievements');
    }, [user, firestore]);

    const { data: unlockedAchievements, isLoading } = useCollection<Achievement>(userAchievementsRef);

    const unlockedAchievementIds = new Set(unlockedAchievements?.map(a => a.id));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Trophy Room
        </h1>
        <p className="text-muted-foreground">A hall showcasing all the heroic achievements waiting to be earned.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allAchievements.map((ach) => {
            const isUnlocked = unlockedAchievementIds.has(ach.id);
            return (
                <Card key={ach.id} className={cn("flex flex-col text-center items-center transition-all", isUnlocked ? 'border-primary bg-primary/5' : 'bg-card opacity-70')}>
                    <CardHeader className="pb-2">
                        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2", isUnlocked ? 'bg-primary/10' : 'bg-secondary')}>
                            <Shield className={cn("w-8 h-8", isUnlocked ? 'text-primary' : 'text-muted-foreground')}/>
                        </div>
                        <CardTitle className="text-base">{ach.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <CardDescription className={cn(isUnlocked && 'text-foreground/80')}>{ach.description}</CardDescription>
                    </CardContent>
                    {isUnlocked && (
                         <div className="flex items-center gap-1.5 text-green-600 font-semibold text-sm pb-4">
                            <CheckCircle2 className="w-4 h-4"/>
                            <span>Unlocked</span>
                        </div>
                    )}
                </Card>
            );
        })}
      </div>
    </div>
  );
}

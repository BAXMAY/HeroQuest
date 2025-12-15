'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { levels, getLevelFromXP } from '@/app/lib/levels';
import { Map, Award, Loader2, Star, Check } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '../context/language-context';
import type { UserProfile } from '../lib/types';
import { useRef, useEffect } from 'react';

export default function RoadmapPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { t } = useLanguage();
    const currentLevelRef = useRef<HTMLDivElement | null>(null);


    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
    
    const currentLevel = getLevelFromXP(userProfile?.totalPoints);
    const isLoading = isUserLoading || isProfileLoading;

    useEffect(() => {
        if (!isLoading && currentLevel && currentLevelRef.current) {
            setTimeout(() => {
                currentLevelRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 300);
        }
    }, [isLoading, currentLevel]);

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
          <Map className="w-8 h-8 text-primary" />
          {t('pageTitles.roadmap')}
        </h1>
        <p className="text-muted-foreground">{t('roadmapDescription')}</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>{t('allLevelsAndTitles')}</CardTitle>
            <CardDescription>{t('allLevelsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative w-full max-w-4xl mx-auto py-8">
                {/* The Path */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 bg-border/40 h-full rounded-full" />
                <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-1 bg-primary/50 rounded-full transition-all duration-1000" 
                    style={{ height: `${((currentLevel?.level || 0) / levels.length) * 100}%` }}
                />
                
                <div className="space-y-8">
                    {levels.map((level, index) => {
                        const isUnlocked = currentLevel.level >= level.level;
                        const isCurrent = currentLevel.level === level.level;

                        return (
                            <div 
                                key={level.level}
                                ref={isCurrent ? currentLevelRef : null}
                                className={cn(
                                    "relative flex items-center w-full",
                                    index % 2 === 0 ? "justify-start" : "justify-end"
                                )}
                            >
                                {/* The node on the central path */}
                                <div className={cn(
                                    "absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-10 transition-colors",
                                    isUnlocked ? "bg-primary" : "bg-border",
                                    isCurrent && "ring-4 ring-primary/30"
                                )}>
                                </div>
                                
                                <div className={cn(
                                    "w-[calc(50%-2rem)]",
                                    index % 2 === 0 ? "pr-4 text-right" : "pl-4 text-left"
                                )}>
                                    <div className={cn(
                                        "p-3 rounded-lg border bg-card/80 backdrop-blur-sm transition-all",
                                        isUnlocked ? "border-primary/30" : "border-dashed",
                                        isCurrent && "border-2 border-primary shadow-lg"
                                    )}>
                                        <p className={cn("font-bold text-sm", isUnlocked ? "text-primary" : "text-muted-foreground")}>Level {level.level}</p>
                                        <p className="font-headline text-lg">{level.title}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-end">
                                            {isUnlocked ? <Check className="w-3 h-3 text-green-500" /> : <Star className="w-3 h-3"/>}
                                            {level.minXP.toLocaleString()} XP
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

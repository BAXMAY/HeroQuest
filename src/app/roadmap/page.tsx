'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { levels, getLevelFromXP } from '@/app/lib/levels';
import { Map, Award } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '../context/language-context';

export default function RoadmapPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { t } = useLanguage();

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile } = useDoc(userProfileRef);
    
    const currentLevel = getLevelFromXP(userProfile?.totalPoints);

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
            <div className="border rounded-lg max-h-[60vh] overflow-y-auto">
                <Table>
                <TableHeader className="sticky top-0 bg-secondary z-10">
                    <TableRow>
                    <TableHead className="w-[100px]">{t('levelColumn')}</TableHead>
                    <TableHead>{t('titleColumn')}</TableHead>
                    <TableHead className="text-right">{t('xpRequired')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {levels.map((level) => (
                    <TableRow 
                        key={level.level} 
                        className={cn(currentLevel?.level === level.level && "bg-primary/20 font-bold border-y-2 border-primary")}
                        style={{
                            // Create a subtle gradient from transparent to primary color as levels increase
                            background: `linear-gradient(90deg, hsl(var(--primary) / ${level.level / 200}) 0%, transparent 100%)`
                        }}
                    >
                        <TableCell>
                           <div className="flex items-center gap-2">
                             {currentLevel?.level === level.level && <Badge>{t('current')}</Badge>}
                             <span>{level.level}</span>
                           </div>
                        </TableCell>
                        <TableCell>{level.title}</TableCell>
                        <TableCell className="text-right flex items-center justify-end gap-1.5">
                            <Award className="w-4 h-4 text-yellow-500/80"/>
                            {level.minXP.toLocaleString()}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

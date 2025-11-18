'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { levels, getLevelFromXP } from '@/app/lib/levels';
import { Map, Award } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function RoadmapPage() {
    const { user } = useUser();
    const firestore = useFirestore();

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
          Level Roadmap
        </h1>
        <p className="text-muted-foreground">Your journey to becoming a Legendary Hero starts here.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>All Levels & Titles</CardTitle>
            <CardDescription>Review all the ranks you can achieve on your adventure.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg max-h-[60vh] overflow-y-auto">
                <Table>
                <TableHeader className="sticky top-0 bg-secondary z-10">
                    <TableRow>
                    <TableHead className="w-[100px]">Level</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">XP Required</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {levels.map((level) => (
                    <TableRow key={level.level} className={cn(currentLevel?.level === level.level && "bg-primary/10 font-bold")}>
                        <TableCell>
                           <div className="flex items-center gap-2">
                             {currentLevel?.level === level.level && <Badge>Current</Badge>}
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

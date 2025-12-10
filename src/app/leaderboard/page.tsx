'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Users, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '../context/language-context';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { UserProfile } from '@/app/lib/types';

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy('totalPoints', 'desc'));
  }, [firestore]);

  const { data: sortedUsers, isLoading } = useCollection<UserProfile>(usersQuery);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400">
            <Crown className="w-4 h-4 mr-1" />
            1st
          </Badge>
        );
      case 2:
        return (
          <Badge className="bg-gray-300 text-gray-800 hover:bg-gray-300">2nd</Badge>
        );
      case 3:
        return (
          <Badge className="bg-yellow-700/50 text-yellow-900 hover:bg-yellow-700/50">3rd</Badge>
        );
      default:
        return <span className="font-semibold text-muted-foreground">{rank}th</span>;
    }
  };
  
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
            <Users className="w-8 h-8 text-primary" />
            {t('pageTitles.leaderboard')}
        </h1>
        <p className="text-muted-foreground">{t('leaderboardDescription')}</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-center">{t('rank')}</TableHead>
              <TableHead>{t('adventurerColumn')}</TableHead>
              <TableHead className="text-right">{t('xp')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers?.map((user, index) => (
              <TableRow key={user.id} className={index < 3 ? 'bg-card' : ''}>
                <TableCell className="text-center font-medium">
                  {getRankBadge(index + 1)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.profilePicture} alt={user.firstName} data-ai-hint="child portrait" />
                      <AvatarFallback>{user.firstName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{user.firstName} {user.lastName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-lg text-primary">
                  {(user.totalPoints || 0).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

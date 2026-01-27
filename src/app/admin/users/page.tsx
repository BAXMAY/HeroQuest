'use client';

import { useCollection, useFirestore, useMemoFirebase, useAdmin } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { UserProfile } from '@/app/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CustomAvatar from '@/app/profile/custom-avatar';
import { Loader2, Users, Award, Coins, Star } from 'lucide-react';
import { useLanguage } from '@/app/context/language-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const { t } = useLanguage();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const router = useRouter();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collection(firestore, 'users'), orderBy('firstName'));
  }, [firestore, isAdmin]);

  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

  const isLoading = isAdminLoading || isLoadingUsers;

  // Route protection
  useEffect(() => {
    if (!isAdminLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isAdminLoading, router]);

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
          {t('pageTitles.users')}
        </h1>
        <p className="text-muted-foreground">{t('usersDescription')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {users?.filter(u => u.firstName !== 'Anonymous').map((user) => (
          <Card key={user.id} className="flex flex-col text-center items-center">
            <CardHeader className="pb-4">
              <Avatar className="h-24 w-24 border-4 border-primary/20 mx-auto">
                {user.avatarConfig ? (
                  <CustomAvatar config={user.avatarConfig} />
                ) : (
                  <>
                    <AvatarImage src={user.profilePicture} alt={user.firstName} data-ai-hint="child portrait" />
                    <AvatarFallback>{user.firstName?.charAt(0)}</AvatarFallback>
                  </>
                )}
              </Avatar>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
              <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
              <CardDescription>@{user.username}</CardDescription>
              <div className="text-xs text-muted-foreground space-y-1 pt-2">
                 <div className="flex items-center justify-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span>{(user.totalPoints || 0).toLocaleString()} XP</span>
                 </div>
                 <div className="flex items-center justify-center gap-2">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>{(user.braveCoins || 0).toLocaleString()} Coins</span>
                 </div>
                  <div className="flex items-center justify-center gap-2">
                    <Star className="w-4 h-4 text-green-500" />
                    <span>{user.questsCompleted || 0} Quests</span>
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

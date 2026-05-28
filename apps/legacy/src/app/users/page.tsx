
'use client';

import { useCollection, useFirestore, useMemoFirebase, useAdmin } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { UserProfile } from '@/app/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CustomAvatar from '@/app/profile/custom-avatar';
import { Loader2, Users, Award, Coins, Star, Mail } from 'lucide-react';
import { useLanguage } from '@/app/context/language-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const { t } = useLanguage();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const router = useRouter();
  const [sortBy, setSortBy] = useState('firstName');

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    const direction = sortBy === 'firstName' ? 'asc' : 'desc';
    return query(collection(firestore, 'users'), orderBy(sortBy, direction));
  }, [firestore, isAdmin, sortBy]);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            {t('pageTitles.users')}
          </h1>
          <p className="text-muted-foreground">{t('usersDescription')}</p>
        </div>
        <div className="flex items-center gap-2">
            <Label htmlFor="sort-by">{t('usersPage.sortBy')}</Label>
            <Select onValueChange={setSortBy} defaultValue={sortBy}>
              <SelectTrigger id="sort-by" className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="firstName">{t('usersPage.sortByName')}</SelectItem>
                <SelectItem value="totalPoints">{t('usersPage.sortByXP')}</SelectItem>
                <SelectItem value="braveCoins">{t('usersPage.sortByCoins')}</SelectItem>
                <SelectItem value="questsCompleted">{t('usersPage.sortByQuests')}</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {users?.filter(u => u.firstName !== 'Anonymous').map((user) => (
          <Link key={user.id} href={`/users/${user.id}`} className="block">
            <Card className="flex flex-col text-center items-center h-full hover:bg-card/90 hover:shadow-md transition-all">
              <CardHeader className="pb-4 relative w-full">
                <Badge className={cn(
                    "absolute top-2 right-2",
                    user.role === 'admin' ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                )}>
                    {t(user.role === 'admin' ? 'usersPage.teacher' : 'usersPage.student')}
                </Badge>
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
                <p className="text-xs text-muted-foreground truncate flex items-center justify-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span>{user.email}</span>
                </p>
                <div className="text-xs text-muted-foreground space-y-1 pt-2">
                   <div className="flex items-center justify-center gap-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span>{(user.totalPoints || 0).toLocaleString()} {t('xp')}</span>
                   </div>
                   <div className="flex items-center justify-center gap-2">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span>{(user.braveCoins || 0).toLocaleString()} {t('braveCoins')}</span>
                   </div>
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-4 h-4 text-green-500" />
                      <span>{user.questsCompleted || 0} {t('nav.startQuest')}s</span>
                   </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

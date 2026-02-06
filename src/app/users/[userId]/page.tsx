
'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useAdmin, useDoc, useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, orderBy, query } from 'firebase/firestore';
import type { UserProfile, Deed } from '@/app/lib/types';
import { Loader2, User, Award, Coins, Star, ArrowLeft, CheckCircle, XCircle, Hourglass } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CustomAvatar from '@/app/profile/custom-avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/app/context/language-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function UserQuestsPage() {
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();
  const firestore = useFirestore();
  const { t } = useLanguage();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);

  const userQuestsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(collection(firestore, 'users', userId, 'volunteer_work'), orderBy('submittedAt', 'desc'));
  }, [firestore, userId]);

  const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);
  const { data: quests, isLoading: isLoadingQuests } = useCollection<Deed>(userQuestsQuery);
  
  const isLoading = isAdminLoading || isLoadingProfile || isLoadingQuests;

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

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <p>{t('userDetailsPage.userNotFound')}</p>
        <Button asChild variant="outline">
            <Link href="/users"><ArrowLeft className="mr-2 h-4 w-4" />{t('userDetailsPage.backToClassroom')}</Link>
        </Button>
      </div>
    );
  }
  
  const getStatusIcon = (status: Deed['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'pending': return <Hourglass className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  }

  const handleToggleLeaderboard = (checked: boolean) => {
    if (!userProfileRef) return;
    updateDocumentNonBlocking(userProfileRef, { showOnLeaderboard: checked });
  };

  return (
    <div className="space-y-8">
        <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/users"><ArrowLeft className="mr-2 h-4 w-4" />{t('userDetailsPage.backToClassroom')}</Link>
        </Button>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <Avatar className="h-24 w-24 border-4 border-primary">
            {userProfile.avatarConfig ? (
                <CustomAvatar config={userProfile.avatarConfig} />
            ) : (
                <>
                <AvatarImage src={userProfile.profilePicture} alt={userProfile.firstName} data-ai-hint="child portrait" />
                <AvatarFallback>{userProfile.firstName?.charAt(0)}</AvatarFallback>
                </>
            )}
        </Avatar>
        <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight font-headline">{userProfile.firstName} {userProfile.lastName}</h1>
            <p className="text-muted-foreground">@{userProfile.username}</p>
             <div className="flex items-center justify-center md:justify-start gap-4 text-sm mt-2 text-muted-foreground">
                 <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span>{(userProfile.totalPoints || 0).toLocaleString()} {t('xp')}</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>{(userProfile.braveCoins || 0).toLocaleString()} {t('braveCoins')}</span>
                 </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-green-500" />
                    <span>{userProfile.questsCompleted || 0} {t('nav.startQuest')}s</span>
                 </div>
              </div>
        </div>
        <div className="flex items-center space-x-2">
            <Switch
                id="leaderboard-toggle"
                checked={userProfile.showOnLeaderboard !== false}
                onCheckedChange={handleToggleLeaderboard}
            />
            <Label htmlFor="leaderboard-toggle">{t('userDetailsPage.showOnLeaderboard')}</Label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('userDetailsPage.submittedQuests')}</CardTitle>
          <CardDescription>{t('userDetailsPage.submittedQuestsDescription', { firstName: userProfile.firstName || ''})}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="hidden md:table-cell">{t('userDetailsPage.image')}</TableHead>
                            <TableHead>{t('userDetailsPage.description')}</TableHead>
                            <TableHead>{t('userDetailsPage.status')}</TableHead>
                            <TableHead className="text-right">{t('userDetailsPage.xp')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quests?.map(quest => (
                            <TableRow key={quest.id}>
                                <TableCell className="hidden md:table-cell">
                                    <div className="relative w-16 h-12 rounded-md overflow-hidden">
                                        <Image src={quest.photo} alt={quest.description} fill className="object-cover"/>
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-sm truncate">{quest.description}</TableCell>
                                <TableCell>
                                    <Badge variant={quest.status === 'approved' ? 'default' : quest.status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize flex items-center gap-1 w-fit">
                                        {getStatusIcon(quest.status)}
                                        {quest.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">{quest.points}</TableCell>
                            </TableRow>
                        ))}
                         {quests?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    {t('userDetailsPage.noQuests')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

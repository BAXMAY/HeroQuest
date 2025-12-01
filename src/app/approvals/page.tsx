'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { UserProfile } from '@/app/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Info, Coins, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '../context/language-context';
import { useAdmin, useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, collectionGroup, doc, increment, query } from 'firebase/firestore';
import type { Deed } from '@/app/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';


const QuestCard = ({ deed, user, onApproval }: { deed: Deed; user?: UserProfile; onApproval: (deed: Deed, status: 'approved' | 'rejected') => void; }) => {
    const { t } = useLanguage();
    return (
        <Card key={deed.id} className="flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar>
                        <AvatarImage src={user?.profilePicture} alt={user?.firstName} data-ai-hint="child portrait"/>
                        <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                        <CardTitle className="text-base">{user?.firstName} {user?.lastName}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                            {t('submittedOn', { date: deed.submittedAt ? new Date(deed.submittedAt.toDate()).toLocaleDateString() : 'N/A' })}
                        </p>
                        </div>
                    </div>
                     {deed.status !== 'pending' && (
                        <Badge variant={deed.status === 'approved' ? 'default' : 'destructive'} className="capitalize">
                            {deed.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {deed.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                            {deed.status}
                        </Badge>
                     )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
            <div className="aspect-video w-full relative overflow-hidden rounded-lg">
                <Image
                src={deed.photo}
                alt={deed.description}
                fill
                className="object-cover transition-transform hover:scale-105"
                data-ai-hint="volunteer children"
                />
            </div>
            <CardDescription>{deed.description}</CardDescription>
            <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-primary">{t('potentialXP')}: {deed.points}</span>
                <div className="flex items-center gap-1 text-amber-500">
                    <Coins className="w-4 h-4" />
                    <span>{Math.floor(deed.points / 10)}</span>
                </div>
            </div>
            </CardContent>
            {deed.status === 'pending' && (
                <CardFooter className="flex gap-2">
                <Button
                    onClick={() => onApproval(deed, 'approved')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                    <Check className="w-4 h-4 mr-2" /> {t('approve')}
                </Button>
                <Button
                    onClick={() => onApproval(deed, 'rejected')}
                    variant="destructive"
                    className="w-full"
                >
                    <X className="w-4 h-4 mr-2" /> {t('reject')}
                </Button>
                </CardFooter>
            )}
        </Card>
    );
};


export default function ApprovalsPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const firestore = useFirestore();

  const allDeedsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collectionGroup(firestore, 'volunteer_work');
  }, [firestore]);

  const { data: allDeeds, isLoading: isLoadingDeeds } = useCollection<Deed>(allDeedsQuery);
  
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  
  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

  const handleApproval = (deed: Deed, newStatus: 'approved' | 'rejected') => {
    if (!firestore) return;
    
    const deedRef = doc(firestore, 'users', deed.userProfileId, 'volunteer_work', deed.id);
    updateDocumentNonBlocking(deedRef, { status: newStatus });

    if (newStatus === 'approved') {
      const userRef = doc(firestore, 'users', deed.userProfileId);
      const coinsAwarded = Math.floor(deed.points / 10);
      updateDocumentNonBlocking(userRef, {
        totalPoints: increment(deed.points),
        braveCoins: increment(coinsAwarded),
        questsCompleted: increment(1)
      });
    }

    toast({
      title: t('questStatusTitle', { status: newStatus }),
      description: t('questStatusDescription', { status: newStatus }),
      variant: newStatus === 'rejected' ? 'destructive' : 'default',
    });
  };

  const isLoading = isLoadingDeeds || isLoadingUsers;
  
  const pendingDeeds = allDeeds?.filter(d => d.status === 'pending');
  const approvedDeeds = allDeeds?.filter(d => d.status === 'approved');
  const rejectedDeeds = allDeeds?.filter(d => d.status === 'rejected');

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
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('pageTitles.approvals')}</h1>
        <p className="text-muted-foreground">{t('approvalsDescription')}</p>
      </div>
        <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">Pending ({pendingDeeds?.length || 0})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({approvedDeeds?.length || 0})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({rejectedDeeds?.length || 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
                {pendingDeeds && pendingDeeds.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                    {pendingDeeds.map((deed) => {
                        const user = users?.find((u) => u.id === deed.userProfileId);
                        return <QuestCard key={deed.id} deed={deed} user={user} onApproval={handleApproval} />;
                    })}
                    </div>
                ) : (
                    <Alert className="mt-6">
                        <Info className="h-4 w-4" />
                        <AlertTitle>{t('allClear')}</AlertTitle>
                        <AlertDescription>{t('noPendingQuests')}</AlertDescription>
                    </Alert>
                )}
            </TabsContent>
            <TabsContent value="approved">
                {approvedDeeds && approvedDeeds.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                    {approvedDeeds.map((deed) => {
                        const user = users?.find((u) => u.id === deed.userProfileId);
                        return <QuestCard key={deed.id} deed={deed} user={user} onApproval={handleApproval} />;
                    })}
                    </div>
                ) : (
                    <Alert className="mt-6">
                        <Info className="h-4 w-4" />
                        <AlertTitle>No Approved Quests</AlertTitle>
                        <AlertDescription>There are no quests that have been approved yet.</AlertDescription>
                    </Alert>
                )}
            </TabsContent>
            <TabsContent value="rejected">
                {rejectedDeeds && rejectedDeeds.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                    {rejectedDeeds.map((deed) => {
                        const user = users?.find((u) => u.id === deed.userProfileId);
                        return <QuestCard key={deed.id} deed={deed} user={user} onApproval={handleApproval} />;
                    })}
                    </div>
                ) : (
                    <Alert className="mt-6">
                        <Info className="h-4 w-4" />
                        <AlertTitle>No Rejected Quests</AlertTitle>
                        <AlertDescription>There are no quests that have been rejected.</AlertDescription>
                    </Alert>
                )}
            </TabsContent>
        </Tabs>
    </div>
  );
}

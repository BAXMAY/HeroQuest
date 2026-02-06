'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { UserProfile } from '@/app/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Info, Coins, Loader2, CheckCircle, XCircle, Wand2, Bot, Undo2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '../context/language-context';
import { useCollection, useFirestore, useMemoFirebase, useAdmin } from '@/firebase';
import { collection, collectionGroup, doc, increment, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import type { Deed } from '@/app/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { checkAndAwardAchievements } from '@/app/lib/achievements';
import { evaluateQuest } from '@/ai/flows/evaluate-quest-flow';


const getPhotoDataUri = async (url: string): Promise<string> => {
    // This can fail if the image host doesn't have CORS enabled.
    // We use a proxy to get around this for development.
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const QuestCard = ({ deed, user, onApproval }: { deed: Deed; user?: UserProfile; onApproval: (deed: Deed, status: 'approved' | 'rejected' | 'pending', points?: number, coins?: number) => void; }) => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [points, setPoints] = useState(deed.points || 50);
    const [coins, setCoins] = useState(Math.floor((deed.points || 50) / 10));
    const [isAiEvaluating, setIsAiEvaluating] = useState(false);

    const handleAiEvaluation = async () => {
        setIsAiEvaluating(true);
        try {
            // Using a CORS proxy to prevent client-side fetch errors
            const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(deed.photo)}`;
            const photoDataUri = await getPhotoDataUri(proxiedUrl);
            
            const result = await evaluateQuest({
                description: deed.description,
                photoDataUri: photoDataUri,
            });

            if (result.points && result.coins) {
                setPoints(result.points);
                setCoins(result.coins);
                toast({
                    title: "AI Suggestion",
                    description: result.justification,
                });
            }

        } catch (error) {
            console.error("AI Evaluation failed", error);
            toast({
                title: "AI Evaluation Failed",
                description: "The AI oracle could not evaluate this quest. Please enter the values manually.",
                variant: "destructive",
            });
        } finally {
            setIsAiEvaluating(false);
        }
    };


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
            {deed.status === 'pending' ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`points-${deed.id}`}>XP</Label>
                            <Input id={`points-${deed.id}`} type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor={`coins-${deed.id}`}>Brave Coins</Label>
                            <Input id={`coins-${deed.id}`} type="number" value={coins} onChange={(e) => setCoins(Number(e.target.value))} />
                        </div>
                    </div>
                     <Button variant="outline" className="w-full" onClick={handleAiEvaluation} disabled={isAiEvaluating}>
                        {isAiEvaluating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                        Ask AI for suggestion
                    </Button>
                </div>
            ) : (
                <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-primary">{t('potentialXP')}: {deed.points}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                        <Coins className="w-4 h-4" />
                        <span>{Math.floor(deed.points / 10)}</span>
                    </div>
                </div>
            )}
            </CardContent>
            {deed.status === 'pending' && (
                <CardFooter className="flex gap-2">
                <Button
                    onClick={() => onApproval(deed, 'approved', points, coins)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                    <Check className="w-4 h-4 mr-2" /> {t('approve')}
                </Button>
                <Button
                    onClick={() => onApproval(deed, 'rejected')}
                    variant="destructive"
                    className="flex-1"
                >
                    <X className="w-4 h-4 mr-2" /> {t('reject')}
                </Button>
                </CardFooter>
            )}
            {deed.status !== 'pending' && (
                 <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => onApproval(deed, 'pending')}>
                        <Undo2 className="w-4 h-4 mr-2" />
                        Move back to Pending
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
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const allDeedsQuery = useMemoFirebase(() => {
    if (!firestore || isAdminLoading || !isAdmin) return null;
    return collectionGroup(firestore, 'volunteer_work');
  }, [firestore, isAdmin, isAdminLoading]);

  const { data: allDeeds, isLoading: isLoadingDeeds } = useCollection<Deed>(allDeedsQuery);
  
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || isAdminLoading || !isAdmin) return null;
    return collection(firestore, 'users');
  }, [firestore, isAdmin, isAdminLoading]);
  
  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);
  const pendingDeeds = allDeeds?.filter(d => d.status === 'pending');

  const handleApproval = async (deed: Deed, newStatus: 'approved' | 'rejected' | 'pending', points?: number, coins?: number) => {
    if (!firestore) return;

    const batch = writeBatch(firestore);
    const deedRef = doc(firestore, 'users', deed.userProfileId, 'volunteer_work', deed.id);
    const userRef = doc(firestore, 'users', deed.userProfileId);
    const originalStatus = deed.status;

    // Update the deed's status
    batch.update(deedRef, { status: newStatus, points: newStatus === 'approved' ? points : deed.points });

    // Handle stat changes based on status transitions

    // 1. Moving from PENDING to APPROVED
    if (newStatus === 'approved' && originalStatus === 'pending') {
      const pointsAwarded = points || deed.points;
      const coinsAwarded = coins || Math.floor(pointsAwarded / 10);
      
      batch.update(userRef, {
        totalPoints: increment(pointsAwarded),
        braveCoins: increment(coinsAwarded),
        questsCompleted: increment(1)
      });
      
      // Create a notification for the user
      const notificationsCollection = collection(firestore, 'users', deed.userProfileId, 'notifications');
      const notificationRef = doc(notificationsCollection);
      batch.set(notificationRef, {
        title: 'Quest Approved!',
        description: `Your quest "${deed.description.substring(0, 30)}..." was approved. You earned ${pointsAwarded} XP!`,
        createdAt: serverTimestamp(),
        read: false,
        type: 'quest_approved',
        link: '/dashboard'
      });
    }

    // 2. Moving from APPROVED back to PENDING
    if (newStatus === 'pending' && originalStatus === 'approved') {
        const pointsToDecrement = deed.points;
        const coinsToDecrement = Math.floor(pointsToDecrement / 10);
        
        batch.update(userRef, {
            totalPoints: increment(-pointsToDecrement),
            braveCoins: increment(-coinsToDecrement),
            questsCompleted: increment(-1)
        });
        // Note: We are not deleting the original approval notification for simplicity.
    }

    await batch.commit();

    // Post-commit actions (only for new approvals)
    if (newStatus === 'approved' && originalStatus === 'pending') {
        const updatedUserSnap = await getDoc(userRef);
        if (updatedUserSnap.exists()) {
            const updatedUserProfile = { id: updatedUserSnap.id, ...updatedUserSnap.data() } as UserProfile;
            const newAchievements = await checkAndAwardAchievements(updatedUserProfile);

            if (newAchievements.length > 0) {
                toast({
                    title: 'Achievement Unlocked!',
                    description: `You've earned: ${newAchievements.map(a => a.name).join(', ')}`,
                });
            }
        }
    }
    
    let toastTitle = '';
    let toastDescription = '';

    if (newStatus === 'pending') {
        toastTitle = 'Quest Reverted';
        toastDescription = 'The quest has been moved back to the pending queue.';
    } else {
        toastTitle = t('questStatusTitle', { status: newStatus });
        toastDescription = t('questStatusDescription', { status: newStatus });
    }

    toast({
      title: toastTitle,
      description: toastDescription,
      variant: newStatus === 'rejected' ? 'destructive' : 'default',
    });
  };

  useEffect(() => {
    // Cannot be an effect if we need to call async functions. 
    // This is defined inside useEffect to capture the necessary variables.
    const autoProcessDeed = async () => {
        if (isAutoPilotActive && !isProcessing && pendingDeeds && pendingDeeds.length > 0) {
            const deedToProcess = pendingDeeds[0];
            
            setIsProcessing(true);
            const user = users?.find(u => u.id === deedToProcess.userProfileId);
            try {
                const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(deedToProcess.photo)}`;
                const photoDataUri = await getPhotoDataUri(proxiedUrl);
                
                const result = await evaluateQuest({
                    description: deedToProcess.description,
                    photoDataUri: photoDataUri,
                });

                if (result.points && result.points > 0 && result.coins) {
                    await handleApproval(deedToProcess, 'approved', result.points, result.coins);
                    toast({
                        title: `AI Auto-Approved`,
                        description: `Quest for ${user?.firstName} approved with ${result.points} XP. Justification: ${result.justification}`,
                    });
                } else {
                    await handleApproval(deedToProcess, 'rejected');
                    toast({
                        title: `AI Auto-Rejected`,
                        description: `AI could not determine a fair reward for ${user?.firstName}'s quest.`,
                        variant: 'destructive'
                    });
                }
            } catch (error) {
                console.error("AI Auto-Pilot Error:", error);
                await handleApproval(deedToProcess, 'rejected');
                toast({
                    title: `AI Error`,
                    description: `Auto-approval failed for ${user?.firstName}'s quest. It has been rejected.`,
                    variant: 'destructive'
                });
            } finally {
                setIsProcessing(false);
            }
        }
    };
    
    autoProcessDeed();
}, [isAutoPilotActive, pendingDeeds, isProcessing, users, handleApproval, toast]);


  const isLoading = isLoadingDeeds || isLoadingUsers || isAdminLoading;
  
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

        <div className="flex items-center space-x-2 rounded-lg border p-4">
            <Bot className="w-5 h-5 text-primary"/>
            <Label htmlFor="autopilot-switch" className="flex-grow font-medium">
            AI Auto-Pilot
            <p className="text-xs font-normal text-muted-foreground">Automatically approve or reject pending quests using AI.</p>
            </Label>
            {isProcessing && <Loader2 className="w-4 h-4 animate-spin"/>}
            <Switch
            id="autopilot-switch"
            checked={isAutoPilotActive}
            onCheckedChange={setIsAutoPilotActive}
            disabled={isProcessing}
            />
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

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deeds as initialDeeds, users } from '@/app/lib/mock-data';
import type { Deed } from '@/app/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ApprovalsPage() {
  const [deeds, setDeeds] = useState<Deed[]>(initialDeeds);
  const { toast } = useToast();

  const pendingDeeds = deeds.filter((d) => d.status === 'pending');

  const handleApproval = (deedId: string, newStatus: 'approved' | 'rejected') => {
    const deed = deeds.find(d => d.id === deedId);
    if (!deed) return;

    setDeeds((prevDeeds) =>
      prevDeeds.map((d) => (d.id === deedId ? { ...d, status: newStatus } : d))
    );
    toast({
      title: `Quest ${newStatus}!`,
      description: `The submission has been ${newStatus}.`,
      variant: newStatus === 'rejected' ? 'destructive' : 'default',
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Quest Review</h1>
        <p className="text-muted-foreground">Review heroic deeds and award experience points!</p>
      </div>

      {pendingDeeds.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pendingDeeds.map((deed) => {
            const user = users.find((u) => u.id === deed.userId);
            return (
              <Card key={deed.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user?.avatar} alt={user?.name} data-ai-hint="child portrait"/>
                      <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{user?.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(deed.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
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
                  <div className="text-sm font-semibold text-primary">Potential XP: {deed.points}</div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    onClick={() => handleApproval(deed.id, 'approved')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" /> Approve
                  </Button>
                  <Button
                    onClick={() => handleApproval(deed.id, 'rejected')}
                    variant="destructive"
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
         <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>All Clear!</AlertTitle>
          <AlertDescription>
            There are no pending quests to review. Great job!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

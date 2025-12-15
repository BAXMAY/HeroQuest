'use client';

import { useUser, useFirestore, useDoc, updateDocumentNonBlocking, useMemoFirebase, useCollection } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, doc } from 'firebase/firestore';
import { Award, Coins, Loader2, Save, Shield, Star } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { getLevelFromXP } from '../lib/levels';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Achievement, UserProfile } from '../lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '../context/language-context';

const profileFormSchema = z.object({
  firstName: z.string().min(2, 'First name is too short').max(50, 'First name is too long'),
  lastName: z.string().min(2, 'Last name is too short').max(50, 'Last name is too long'),
  username: z.string().min(3, 'Username is too short').max(30, 'Username is too long'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t } = useLanguage();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const achievementsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'achievements');
  }, [user, firestore]);


  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  const { data: achievements, isLoading: areAchievementsLoading } = useCollection<Achievement>(achievementsRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        username: userProfile.username || '',
      });
    }
  }, [userProfile, form]);

  const onSubmit = (data: ProfileFormValues) => {
    if (!userProfileRef) return;
    updateDocumentNonBlocking(userProfileRef, data);
    toast({
      title: t('profileUpdated'),
      description: t('profileUpdatedDescription'),
    });
  };
  
  const isLoading = isUserLoading || isProfileLoading || areAchievementsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
           <p>Could not load user profile.</p>
        </div>
    );
  }

  const displayName = userProfile.firstName || user.displayName || 'Adventurer';
  const currentLevel = getLevelFromXP(userProfile.totalPoints);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarImage src={userProfile.profilePicture || user?.photoURL} alt={displayName} data-ai-hint="child portrait" />
            <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight font-headline">{displayName} {userProfile.lastName}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="text-lg font-semibold text-primary">{t(`levelNames.${currentLevel.title}` as any)}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('yourProgress')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                    <Award className="w-6 h-6 text-yellow-500"/>
                    <p className="text-2xl font-bold font-headline">{(userProfile.totalPoints || 0).toLocaleString()}</p>
                </div>
              <p className="text-sm text-muted-foreground">{t('experiencePoints')}</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                    <Coins className="w-6 h-6 text-amber-500"/>
                    <p className="text-2xl font-bold font-headline">{(userProfile.braveCoins || 0).toLocaleString()}</p>
                </div>
              <p className="text-sm text-muted-foreground">{t('braveCoins')}</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                    <Star className="w-6 h-6 text-green-500"/>
                    <p className="text-2xl font-bold font-headline">{(userProfile.questsCompleted || 0).toLocaleString()}</p>
                </div>
              <p className="text-sm text-muted-foreground">{t('questsCompleted')}</p>
            </div>
          </div>
          <div>
            <Label>{t('levelProgress')}</Label>
            <Progress value={(userProfile.totalPoints / 2000) * 100} className="h-2 mt-1" />
             <p className="text-xs text-muted-foreground mt-1 text-right">{t('level', { level: currentLevel.level })}</p>
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>{t('achievements')}</CardTitle>
          <CardDescription>{t('achievementsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {achievements && achievements.length > 0 ? (
            <TooltipProvider>
              <div className="flex flex-wrap gap-4">
                {achievements.map((ach) => (
                  <Tooltip key={ach.id}>
                    <TooltipTrigger>
                      <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-accent/10 w-24 h-24 justify-center">
                        <Shield className="w-8 h-8 text-accent" />
                        <span className="text-xs font-semibold text-center truncate w-full">{ach.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-bold">{ach.name}</p>
                      <p className="text-sm text-muted-foreground">{ach.description}</p>
                      {ach.unlockedAt && <p className="text-xs text-muted-foreground/80 mt-1">{t('unlocked')}: {new Date(ach.unlockedAt).toLocaleDateString()}</p>}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          ) : (
            <p className="text-muted-foreground text-sm">{t('noAchievements')}</p>
          )}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>{t('editProfile')}</CardTitle>
          <CardDescription>{t('editProfileDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('firstName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('firstName')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('lastName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('lastName')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('username')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('username')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {t('saveChanges')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

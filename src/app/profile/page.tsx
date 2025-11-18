'use client';

import { useUser, useFirestore, useDoc, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc } from 'firebase/firestore';
import { Award, Coins, Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { getLevelFromXP } from '../lib/levels';
import { Progress } from '@/components/ui/progress';

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

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<any>(userProfileRef);

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
      title: 'Profile Updated',
      description: 'Your profile has been successfully saved.',
    });
  };
  
  const isLoading = isUserLoading || isProfileLoading;

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
            <p className="text-lg font-semibold text-primary">{currentLevel.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                    <Award className="w-6 h-6 text-yellow-500"/>
                    <p className="text-2xl font-bold font-headline">{(userProfile.totalPoints || 0).toLocaleString()}</p>
                </div>
              <p className="text-sm text-muted-foreground">Experience Points</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                    <Coins className="w-6 h-6 text-amber-500"/>
                    <p className="text-2xl font-bold font-headline">{0}</p>
                </div>
              <p className="text-sm text-muted-foreground">Brave Coins</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                    <Award className="w-6 h-6 text-green-500"/>
                    <p className="text-2xl font-bold font-headline">{0}</p>
                </div>
              <p className="text-sm text-muted-foreground">Quests Completed</p>
            </div>
          </div>
          <div>
            <Label>Level Progress</Label>
            <Progress value={(userProfile.totalPoints / 2000) * 100} className="h-2 mt-1" />
             <p className="text-xs text-muted-foreground mt-1 text-right">Level {currentLevel.level}</p>
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information here.</CardDescription>
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
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your first name" {...field} />
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
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your last name" {...field} />
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
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Your public username" {...field} />
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
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

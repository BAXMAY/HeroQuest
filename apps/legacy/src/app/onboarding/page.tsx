'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/app/components/logo";
import { useAuth, useUser } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { getSdks } from "@/firebase";
import { UserProfile } from "@/app/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "../context/language-context";


export default function OnboardingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { t } = useLanguage();

  const formSchema = z.object({
    firstName: z.string().min(2, t('onboardingPage.firstNameTooShort')),
    lastName: z.string().min(2, t('onboardingPage.lastNameTooShort')),
    username: z.string().min(2, t('onboardingPage.usernameTooShort')),
    gender: z.enum(["male", "female"], { required_error: t('onboardingPage.genderRequired') }),
    birthday: z.string().min(1, { message: t('onboardingPage.birthdayRequired') }),
  });
  
  useEffect(() => {
    // If user is not logged in or is anonymous, redirect them
    if (!isUserLoading && (!user || user.isAnonymous)) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.displayName?.split(' ')[0] || "",
      lastName: user?.displayName?.split(' ')[1] || "",
      username: user?.email?.split('@')[0] || "",
      birthday: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    setIsLoading(true);

    const { firestore } = getSdks(auth.app);
    const userProfileRef = doc(firestore, 'users', user.uid);

    const profileData: Omit<UserProfile, 'id' | 'totalPoints' | 'braveCoins' | 'questsCompleted' | 'role'> = {
        email: user.email || '',
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        profilePicture: user.photoURL || '',
        gender: values.gender,
        birthday: values.birthday,
    };
    
    const fullProfile: UserProfile = {
        ...profileData,
        id: user.uid,
        totalPoints: 0,
        braveCoins: 0,
        questsCompleted: 0,
        role: 'student',
    }

    try {
        await setDoc(userProfileRef, fullProfile);
        toast({
            title: t('onboardingPage.profileCreatedTitle'),
            description: t('onboardingPage.profileCreatedDescription'),
        });
        router.push('/dashboard');
    } catch(e) {
        console.error(e);
        toast({
            title: t('onboardingPage.profileSaveErrorTitle'),
            description: t('onboardingPage.profileSaveErrorDescription'),
            variant: "destructive",
        })
    } finally {
        setIsLoading(false);
    }
  }

  if (isUserLoading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
        <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
                 <div className="flex justify-center mb-4">
                    <Logo className="w-16 h-16" />
                </div>
                <CardTitle className="text-3xl font-headline">{t('onboardingPage.title')}</CardTitle>
                <CardDescription>{t('onboardingPage.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('onboardingPage.firstName')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('onboardingPage.firstNamePlaceholder')} {...field} />
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
                                <FormLabel>{t('onboardingPage.lastName')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('onboardingPage.lastNamePlaceholder')} {...field} />
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
                          <FormLabel>{t('onboardingPage.username')}</FormLabel>
                          <FormControl>
                              <Input placeholder={t('onboardingPage.usernamePlaceholder')} {...field} />
                          </FormControl>
                           <FormDescription>{t('onboardingPage.usernameDescription')}</FormDescription>
                          <FormMessage />
                          </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{t('onboardingPage.gender')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('onboardingPage.selectGender')} />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="male">{t('onboardingPage.male')}</SelectItem>
                                    <SelectItem value="female">{t('onboardingPage.female')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="birthday"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('onboardingPage.birthday')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="YYYY-MM-DD" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('onboardingPage.completeProfile')}
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}

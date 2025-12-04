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
import Mascot from "@/app/components/mascot";
import { useAuth, useUser } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { getSdks } from "@/firebase";
import { UserProfile } from "@/app/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const formSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  username: z.string().min(3, "Username must be at least 3 characters."),
  gender: z.enum(["male", "female", "other"], { required_error: "Please select a gender." }),
  birthday: z.date({ required_error: "Please select your birthday." }),
});

export default function OnboardingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  
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
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    setIsLoading(true);

    const { firestore } = getSdks(auth.app);
    const userProfileRef = doc(firestore, 'users', user.uid);

    const profileData: Omit<UserProfile, 'id' | 'totalPoints' | 'braveCoins' | 'questsCompleted'> = {
        email: user.email || '',
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        profilePicture: user.photoURL || '',
        gender: values.gender,
        birthday: format(values.birthday, 'yyyy-MM-dd'),
    };
    
    const fullProfile: UserProfile = {
        ...profileData,
        id: user.uid,
        totalPoints: 0,
        braveCoins: 0,
        questsCompleted: 0,
    }

    try {
        await setDoc(userProfileRef, fullProfile);
        toast({
            title: "Profile Created!",
            description: "Welcome to the guild! Your adventure begins now.",
        });
        router.push('/dashboard');
    } catch(e) {
        console.error(e);
        toast({
            title: "Something went wrong",
            description: "Could not save your profile. Please try again.",
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
                    <Mascot className="w-16 h-16 text-primary" />
                </div>
                <CardTitle className="text-3xl font-headline">Welcome to the Guild!</CardTitle>
                <CardDescription>Let's create your hero profile to get you started.</CardDescription>
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
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Brave" {...field} />
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
                                    <Input placeholder="Hero" {...field} />
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
                          <FormLabel>Nickname</FormLabel>
                          <FormControl>
                              <Input placeholder="BraveHero123" {...field} />
                          </FormControl>
                           <FormDescription>This is your public display name.</FormDescription>
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
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your gender" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
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
                                <FormItem className="flex flex-col">
                                <FormLabel>Date of birth</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Complete Profile
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}

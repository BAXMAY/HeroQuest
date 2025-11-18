'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Mascot from "@/app/components/mascot";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log("Login values:", values);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Logged In!",
        description: "Welcome back, adventurer!",
      });
      router.push('/');
    }, 1500);
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="max-w-sm w-full">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <Mascot className="w-16 h-16 text-primary" />
                </div>
                <CardTitle className="text-3xl font-headline">Welcome Back!</CardTitle>
                <CardDescription>Enter your credentials to continue your quest.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="adventurer@heroquest.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                    </Button>
                </form>
                </Form>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    New to the guild?{' '}
                    <Link href="/register" className="text-primary hover:underline font-semibold">
                        Join the adventure!
                    </Link>
                </p>
            </CardContent>
        </Card>
    </div>
  );
}

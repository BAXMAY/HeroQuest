'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking, useCollection, useFirebase, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import { collection, doc, writeBatch } from "firebase/firestore";
import { Loader2, PlusCircle, Save, Shield, Trash2, Database } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import type { Achievement, Reward } from "../lib/types";
import { useLanguage } from "../context/language-context";
import { rewards as mockRewards } from '@/app/lib/mock-data';


const achievementSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name is too short"),
  description: z.string().min(10, "Description is too short"),
  icon: z.string().min(2, "Icon name is required"),
});

const rewardSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name is too short"),
  description: z.string().min(10, "Description is too short"),
  cost: z.coerce.number().min(1, "Cost must be at least 1"),
  image: z.string().url("Must be a valid image URL"),
});

const adminFormSchema = z.object({
  achievements: z.array(achievementSchema),
  rewards: z.array(rewardSchema),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

export default function AdminPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const { t } = useLanguage();

  const achievementsCollectionRef = useMemoFirebase(() => collection(firestore, 'achievements'), [firestore]);
  const rewardsCollectionRef = useMemoFirebase(() => collection(firestore, 'rewards'), [firestore]);
  
  const { data: achievements, isLoading: loadingAchievements } = useCollection<Achievement>(achievementsCollectionRef);
  const { data: rewards, isLoading: loadingRewards } = useCollection<Reward>(rewardsCollectionRef);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    values: {
        achievements: achievements || [],
        rewards: rewards || []
    }
  });

  const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({
    control: form.control,
    name: "achievements",
  });

  const { fields: rewardFields, append: appendReward, remove: removeReward } = useFieldArray({
    control: form.control,
    name: "rewards",
  });

  const handleSeedRewards = async () => {
    if (!firestore) return;
    const batch = writeBatch(firestore);
    mockRewards.forEach((reward) => {
      // Use the id from mock data if available, otherwise let Firestore generate one
      const docRef = reward.id ? doc(firestore, "rewards", reward.id) : doc(collection(firestore, "rewards"));
      batch.set(docRef, reward);
    });

    try {
      await batch.commit();
      toast({
        title: "Rewards Seeded!",
        description: "The mock rewards have been added to the database.",
      });
    } catch (error) {
      console.error("Error seeding rewards: ", error);
      toast({
        title: "Seeding Failed",
        description: "Could not seed the rewards.",
        variant: "destructive",
      });
    }
  };


  const onSubmit = async (data: AdminFormValues) => {
    try {
      // This is a simplified save - in a real app, you'd check for diffs
      for (const achievement of data.achievements) {
        if (achievement.id) {
          const ref = doc(firestore, 'achievements', achievement.id);
          updateDocumentNonBlocking(ref, achievement);
        } else {
          // This is a new achievement
          addDocumentNonBlocking(achievementsCollectionRef, achievement);
        }
      }
      for (const reward of data.rewards) {
        if (reward.id) {
          const ref = doc(firestore, 'rewards', reward.id);
          updateDocumentNonBlocking(ref, reward);
        } else {
           addDocumentNonBlocking(rewardsCollectionRef, reward);
        }
      }
       toast({
        title: t('saveSuccessTitle'),
        description: t('saveSuccessDescription'),
      });
      // In a real app you might want to refresh the data after saving
    } catch (error) {
      console.error(error);
      toast({
        title: t('saveErrorTitle'),
        description: t('saveErrorDescription'),
        variant: "destructive",
      });
    }
  };
  
  const isLoading = loadingAchievements || loadingRewards;

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary"/>
            {t('pageTitles.admin')}
        </h1>
        <p className="text-muted-foreground">{t('adminDescription')}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="achievements">
            <TabsList>
              <TabsTrigger value="achievements">{t('achievements')} ({achievementFields.length})</TabsTrigger>
              <TabsTrigger value="rewards">{t('rewards')} ({rewardFields.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="achievements">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('manageAchievements')}</CardTitle>
                        <CardDescription>{t('manageAchievementsDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? <Loader2 className="animate-spin" /> : achievementFields.map((field, index) => (
                           <Card key={field.id} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`achievements.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('name')}</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`achievements.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('description')}</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`achievements.${index}.icon`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('icon')}</FormLabel>
                                                <FormControl><Input placeholder={t('iconPlaceholder')} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                 <Button type="button" variant="destructive" size="sm" className="mt-4" onClick={() => removeAchievement(index)}>
                                    <Trash2 className="w-4 h-4 mr-2"/>
                                    {t('remove')}
                                </Button>
                           </Card>
                        ))}
                         <Button type="button" variant="outline" onClick={() => appendAchievement({ name: '', description: '', icon: '' })}>
                            <PlusCircle className="w-4 h-4 mr-2"/>
                            {t('addAchievement')}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="rewards">
               <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                      <div>
                        <CardTitle>{t('manageRewards')}</CardTitle>
                        <CardDescription>{t('manageRewardsDescription')}</CardDescription>
                      </div>
                      <Button type="button" variant="secondary" onClick={handleSeedRewards}>
                          <Database className="w-4 h-4 mr-2"/>
                          Seed Rewards
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? <Loader2 className="animate-spin" /> : rewardFields.map((field, index) => (
                           <Card key={field.id} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                    <div className="space-y-4">
                                         <FormField
                                            control={form.control}
                                            name={`rewards.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('name')}</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`rewards.${index}.description`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('description')}</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name={`rewards.${index}.cost`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('costInBraveCoins')}</FormLabel>
                                                    <FormControl><Input type="number" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`rewards.${index}.image`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('imageUrl')}</FormLabel>
                                                    <FormControl><Input placeholder={t('imageUrlPlaceholder')} {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                                 <Button type="button" variant="destructive" size="sm" className="mt-4" onClick={() => removeReward(index)}>
                                    <Trash2 className="w-4 h-4 mr-2"/>
                                    {t('remove')}
                                </Button>
                           </Card>
                        ))}
                         <Button type="button" variant="outline" onClick={() => appendReward({ name: '', description: '', cost: 100, image: '' })}>
                            <PlusCircle className="w-4 h-4 mr-2"/>
                            {t('addReward')}
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>

           <div className="mt-6">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {t('saveAllChanges')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

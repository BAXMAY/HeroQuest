'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking, useCollection, useFirebase, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Loader2, PlusCircle, Save, Shield, Trash2, Database, Upload, Edit, Check } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import type { Achievement, Reward, Deed } from "../lib/types";
import { useLanguage } from "../context/language-context";
import { rewards as mockRewards, deeds as mockDeeds, allAchievements as mockAchievements } from '@/app/lib/mock-data';
import { useState } from "react";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


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
  // rewards are now handled separately
});

type AdminFormValues = z.infer<typeof adminFormSchema>;
type RewardFormValues = z.infer<typeof rewardSchema>;

const RewardFormDialog = ({ reward, onSave, children }: { reward?: Reward; onSave: (data: RewardFormValues) => void; children: React.ReactNode }) => {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const form = useForm<RewardFormValues>({
        resolver: zodResolver(rewardSchema),
        defaultValues: reward || { name: '', description: '', cost: 100, image: '' }
    });
    
    const handleSave = (data: RewardFormValues) => {
        onSave(data);
        setOpen(false);
        form.reset();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{reward ? 'Edit Reward' : 'Add New Reward'}</DialogTitle>
                    <DialogDescription>
                        {reward ? 'Edit the details of this reward.' : 'Create a new reward for the shop.'}
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
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
                            name="description"
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
                            name="cost"
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
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('imageUrl')}</FormLabel>
                                    <FormControl><Input placeholder={t('imageUrlPlaceholder')} {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                 </Form>
            </DialogContent>
        </Dialog>
    )
}

export default function AdminPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const achievementsCollectionRef = useMemoFirebase(() => collection(firestore, 'achievements'), [firestore]);
  const rewardsCollectionRef = useMemoFirebase(() => collection(firestore, 'rewards'), [firestore]);
  
  const { data: achievements, isLoading: loadingAchievements } = useCollection<Achievement>(achievementsCollectionRef);
  const { data: rewards, isLoading: loadingRewards } = useCollection<Reward>(rewardsCollectionRef);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    values: {
        achievements: achievements || [],
    }
  });

  const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({
    control: form.control,
    name: "achievements",
  });
  
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setImageFile(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
        toast({ title: "No file selected", description: "Please select an image file to upload.", variant: "destructive" });
        return;
    }
    setIsUploading(true);
    setUploadedImageUrl(null);
    try {
        const storage = getStorage();
        const fileRef = storageRef(storage, `uploads/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(fileRef, imageFile);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        setUploadedImageUrl(downloadUrl);
        toast({ title: "Upload Successful!", description: "You can now copy the URL below." });
    } catch (error) {
        console.error("Error uploading image: ", error);
        toast({ title: "Upload Failed", description: "There was an error uploading your image.", variant: "destructive" });
    } finally {
        setIsUploading(false);
    }
  };

  const handleSeedRewards = async () => {
    if (!firestore) return;
    const batch = writeBatch(firestore);
    mockRewards.forEach((reward) => {
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
  
  const handleSeedQuests = async () => {
    if (!firestore) return;
    const batch = writeBatch(firestore);
    // Note: This assumes users with IDs like 'user-1', 'user-2' exist.
    // In a real scenario, you would fetch real user IDs.
    mockDeeds.forEach((deed) => {
      const deedRef = doc(firestore, "users", deed.userId, "volunteer_work", deed.id);
      const deedData = {
        ...deed,
        submittedAt: serverTimestamp(),
      }
      batch.set(deedRef, deedData);
    });

    try {
      await batch.commit();
      toast({
        title: "Quests Seeded!",
        description: "The mock quests have been added to various users.",
      });
    } catch (error) {
      console.error("Error seeding quests: ", error);
      toast({
        title: "Seeding Failed",
        description: "Could not seed the quests. Ensure mock users exist.",
        variant: "destructive",
      });
    }
  };

  const handleSeedAchievements = async () => {
    if (!firestore) return;
    const batch = writeBatch(firestore);
    mockAchievements.forEach((achievement) => {
      const docRef = doc(firestore, "achievements", achievement.id);
      batch.set(docRef, achievement);
    });

    try {
      await batch.commit();
      toast({
        title: "Achievements Seeded!",
        description: "The mock achievements have been added to the database.",
      });
    } catch (error) {
      console.error("Error seeding achievements: ", error);
      toast({
        title: "Seeding Failed",
        description: "Could not seed the achievements.",
        variant: "destructive",
      });
    }
  };


  const onAchievementsSubmit = async (data: AdminFormValues) => {
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

  const handleSaveReward = (data: RewardFormValues) => {
    try {
        if (data.id) {
            const ref = doc(firestore, 'rewards', data.id);
            updateDocumentNonBlocking(ref, data);
            toast({ title: "Reward Updated!", description: `${data.name} has been updated.` });
        } else {
            addDocumentNonBlocking(rewardsCollectionRef, data);
            toast({ title: "Reward Added!", description: `${data.name} has been added to the shop.` });
        }
    } catch (error) {
        console.error(error);
        toast({ title: "Error Saving Reward", variant: "destructive" });
    }
  };

  const handleDeleteReward = (rewardId: string) => {
    const ref = doc(firestore, 'rewards', rewardId);
    deleteDocumentNonBlocking(ref);
    toast({ title: "Reward Removed", description: "The reward has been removed from the shop." });
  }
  
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

       <Card>
        <CardHeader>
          <CardTitle>Image Uploader</CardTitle>
          <CardDescription>Upload images to Firebase Storage to get a usable URL.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Select Image</Label>
            <Input id="image-upload" type="file" accept="image/*" onChange={handleImageFileChange} />
          </div>
          <Button onClick={handleImageUpload} disabled={isUploading || !imageFile}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload Image
          </Button>
          {uploadedImageUrl && (
            <div className="space-y-4">
              <p className="text-sm font-medium">Upload successful! Copy this URL:</p>
              <Input readOnly value={uploadedImageUrl} onFocus={(e) => e.target.select()} />
              <div className="relative aspect-video w-full max-w-sm rounded-md border overflow-hidden">
                <Image src={uploadedImageUrl} alt="Uploaded image preview" fill className="object-contain" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="achievements">
        <TabsList>
            <TabsTrigger value="achievements">{t('achievements')} ({achievementFields.length})</TabsTrigger>
            <TabsTrigger value="rewards">{t('rewards')} ({rewards?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="achievements">
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onAchievementsSubmit)}>
                    <Card>
                        <CardHeader className="flex flex-row flex-wrap justify-between items-center gap-4">
                            <div>
                                <CardTitle>{t('manageAchievements')}</CardTitle>
                                <CardDescription>{t('manageAchievementsDescription')}</CardDescription>
                            </div>
                            <Button type="button" variant="secondary" onClick={handleSeedAchievements}>
                                <Database className="w-4 h-4 mr-2"/>
                                Seed Achievements
                            </Button>
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
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => appendAchievement({ name: '', description: '', icon: '' })}>
                                    <PlusCircle className="w-4 h-4 mr-2"/>
                                    {t('addAchievement')}
                                </Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4" />
                                )}
                                {t('saveAllChanges')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
             </Form>
        </TabsContent>
        <TabsContent value="rewards">
            <Card>
                <CardHeader className="flex flex-row flex-wrap justify-between items-center gap-4">
                    <div>
                    <CardTitle>{t('manageRewards')}</CardTitle>
                    <CardDescription>{t('manageRewardsDescription')}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={handleSeedRewards}>
                        <Database className="w-4 h-4 mr-2"/>
                        Seed Rewards
                    </Button>
                        <Button type="button" variant="secondary" onClick={handleSeedQuests}>
                        <Database className="w-4 h-4 mr-2"/>
                        สร้างเควสจำลอง
                    </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-end">
                       <RewardFormDialog onSave={handleSaveReward}>
                            <Button variant="outline">
                                <PlusCircle className="w-4 h-4 mr-2"/>
                                {t('addReward')}
                            </Button>
                        </RewardFormDialog>
                    </div>
                    {isLoading ? <Loader2 className="animate-spin" /> : (
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('name')}</TableHead>
                                        <TableHead className="hidden md:table-cell">{t('description')}</TableHead>
                                        <TableHead className="text-right">{t('costInBraveCoins')}</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rewards?.map((reward) => (
                                        <TableRow key={reward.id}>
                                            <TableCell className="font-medium">{reward.name}</TableCell>
                                            <TableCell className="hidden md:table-cell max-w-xs truncate">{reward.description}</TableCell>
                                            <TableCell className="text-right">{reward.cost}</TableCell>
                                            <TableCell className="flex gap-2 justify-end">
                                                 <RewardFormDialog reward={reward} onSave={(data) => handleSaveReward({ ...data, id: reward.id })}>
                                                    <Button type="button" variant="ghost" size="icon">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                 </RewardFormDialog>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteReward(reward.id)}>
                                                    <Trash2 className="w-4 h-4 text-destructive"/>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

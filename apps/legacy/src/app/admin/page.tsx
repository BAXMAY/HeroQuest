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
import { Loader2, PlusCircle, Save, Shield, Trash2, Database, Upload, Edit, Check, ShieldCheck, ShieldOff } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Achievement, Reward, Deed } from "../lib/types";
import { useLanguage } from "../context/language-context";
import { rewards as mockRewards, deeds as mockDeeds, allAchievements as mockAchievements } from '@/app/lib/mock-data';
import { useState } from "react";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFunctions, httpsCallable } from "firebase/functions";


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

type AchievementFormValues = z.infer<typeof achievementSchema>;
type RewardFormValues = z.infer<typeof rewardSchema>;

const AchievementFormDialog = ({ achievement, onSave, children }: { achievement?: Achievement; onSave: (data: AchievementFormValues) => void; children: React.ReactNode }) => {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const form = useForm<AchievementFormValues>({
        resolver: zodResolver(achievementSchema),
        defaultValues: achievement || { name: '', description: '', icon: '' }
    });
    
    const handleSave = (data: AchievementFormValues) => {
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
                    <DialogTitle>{achievement ? t('adminPage.editAchievement') : t('adminPage.addNewAchievement')}</DialogTitle>
                    <DialogDescription>
                        {achievement ? t('adminPage.editAchievementDescription') : t('adminPage.addAchievementDescription')}
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
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('icon')}</FormLabel>
                                    <FormControl><Input placeholder={t('iconPlaceholder')} {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">{t('adminPage.cancel')}</Button>
                            </DialogClose>
                            <Button type="submit">{t('adminPage.save')}</Button>
                        </DialogFooter>
                    </form>
                 </Form>
            </DialogContent>
        </Dialog>
    )
}

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
                    <DialogTitle>{reward ? t('adminPage.editReward') : t('adminPage.addNewReward')}</DialogTitle>
                    <DialogDescription>
                        {reward ? t('adminPage.editRewardDescription') : t('adminPage.addRewardDescription')}
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
                                <Button type="button" variant="secondary">{t('adminPage.cancel')}</Button>
                            </DialogClose>
                            <Button type="submit">{t('adminPage.save')}</Button>
                        </DialogFooter>
                    </form>
                 </Form>
            </DialogContent>
        </Dialog>
    )
}

export default function AdminPage() {
  const { firestore, firebaseApp } = useFirebase();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [isMakingAdmin, setIsMakingAdmin] = useState(false);

  const achievementsCollectionRef = useMemoFirebase(() => collection(firestore, 'achievements'), [firestore]);
  const rewardsCollectionRef = useMemoFirebase(() => collection(firestore, 'rewards'), [firestore]);
  
  const { data: achievements, isLoading: loadingAchievements } = useCollection<Achievement>(achievementsCollectionRef);
  const { data: rewards, isLoading: loadingRewards } = useCollection<Reward>(rewardsCollectionRef);
  
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setImageFile(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
        toast({ title: t('adminPage.noFileSelected'), description: t('adminPage.selectFileToUpload'), variant: "destructive" });
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
        toast({ title: t('adminPage.uploadSuccessTitle'), description: t('adminPage.uploadSuccessDescription') });
    } catch (error) {
        console.error("Error uploading image: ", error);
        toast({ title: t('adminPage.uploadFailedTitle'), description: t('adminPage.uploadFailedDescription'), variant: "destructive" });
    } finally {
        setIsUploading(false);
    }
  };

  const handleGrantAdminRole = async () => {
    if (!firebaseApp || !adminEmail) {
        toast({ title: t('adminPage.emailRequiredTitle'), description: t('adminPage.emailRequiredDescription'), variant: "destructive" });
        return;
    }
    setIsMakingAdmin(true);
    try {
        const functions = getFunctions(firebaseApp);
        const addAdminRole = httpsCallable(functions, 'addAdminRole');
        const result: any = await addAdminRole({ email: adminEmail });
        toast({ title: t('adminPage.successTitle'), description: result.data.message });
        setAdminEmail('');
    } catch (error: any) {
        console.error("Error granting admin role:", error);
        toast({ title: t('adminPage.errorTitle'), description: error.message || t('adminPage.grantAdminError'), variant: "destructive" });
    } finally {
        setIsMakingAdmin(false);
    }
  };

  const handleRevokeAdminRole = async () => {
    if (!firebaseApp || !adminEmail) {
        toast({ title: t('adminPage.emailRequiredTitle'), description: t('adminPage.emailRequiredDescription'), variant: "destructive" });
        return;
    }
    setIsMakingAdmin(true);
    try {
        const functions = getFunctions(firebaseApp);
        const removeAdminRole = httpsCallable(functions, 'removeAdminRole');
        const result: any = await removeAdminRole({ email: adminEmail });
        toast({ title: t('adminPage.successTitle'), description: result.data.message });
        setAdminEmail('');
    } catch (error: any) {
        console.error("Error revoking admin role:", error);
        toast({ title: t('adminPage.errorTitle'), description: error.message || t('adminPage.revokeAdminError'), variant: "destructive" });
    } finally {
        setIsMakingAdmin(false);
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
        title: t('adminPage.rewardsSeededTitle'),
        description: t('adminPage.rewardsSeededDescription'),
      });
    } catch (error) {
      console.error("Error seeding rewards: ", error);
      toast({
        title: t('adminPage.seedingFailedTitle'),
        description: t('adminPage.seedRewardsError'),
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
        title: t('adminPage.questsSeededTitle'),
        description: t('adminPage.questsSeededDescription'),
      });
    } catch (error) {
      console.error("Error seeding quests: ", error);
      toast({
        title: t('adminPage.seedingFailedTitle'),
        description: t('adminPage.seedQuestsError'),
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
        title: t('adminPage.achievementsSeededTitle'),
        description: t('adminPage.achievementsSeededDescription'),
      });
    } catch (error) {
      console.error("Error seeding achievements: ", error);
      toast({
        title: t('adminPage.seedingFailedTitle'),
        description: t('adminPage.seedAchievementsError'),
        variant: "destructive",
      });
    }
  };

  const handleSaveAchievement = (data: AchievementFormValues) => {
    try {
        if (data.id) {
            const ref = doc(firestore, 'achievements', data.id);
            updateDocumentNonBlocking(ref, data);
            toast({ title: t('adminPage.achievementUpdatedTitle'), description: t('adminPage.achievementUpdatedDescription', { name: data.name }) });
        } else {
            addDocumentNonBlocking(achievementsCollectionRef, data);
            toast({ title: t('adminPage.achievementAddedTitle'), description: t('adminPage.achievementAddedDescription', { name: data.name }) });
        }
    } catch (error) {
        console.error(error);
        toast({ title: t('adminPage.achievementSaveError'), variant: "destructive" });
    }
  };

  const handleDeleteAchievement = (achievementId: string) => {
    const ref = doc(firestore, 'achievements', achievementId);
    deleteDocumentNonBlocking(ref);
    toast({ title: t('adminPage.achievementRemovedTitle'), description: t('adminPage.achievementRemovedDescription') });
  }

  const handleSaveReward = (data: RewardFormValues) => {
    try {
        if (data.id) {
            const ref = doc(firestore, 'rewards', data.id);
            updateDocumentNonBlocking(ref, data);
            toast({ title: t('adminPage.rewardUpdatedTitle'), description: t('adminPage.rewardUpdatedDescription', { name: data.name }) });
        } else {
            addDocumentNonBlocking(rewardsCollectionRef, data);
            toast({ title: t('adminPage.rewardAddedTitle'), description: t('adminPage.rewardAddedDescription', { name: data.name }) });
        }
    } catch (error) {
        console.error(error);
        toast({ title: t('adminPage.rewardSaveError'), variant: "destructive" });
    }
  };

  const handleDeleteReward = (rewardId: string) => {
    const ref = doc(firestore, 'rewards', rewardId);
    deleteDocumentNonBlocking(ref);
    toast({ title: t('adminPage.rewardRemovedTitle'), description: t('adminPage.rewardRemovedDescription') });
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
          <CardTitle>{t('adminPage.imageUploader')}</CardTitle>
          <CardDescription>{t('adminPage.imageUploaderDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload">{t('adminPage.selectImage')}</Label>
            <Input id="image-upload" type="file" accept="image/*" onChange={handleImageFileChange} />
          </div>
          <Button onClick={handleImageUpload} disabled={isUploading || !imageFile}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {t('adminPage.uploadImage')}
          </Button>
          {uploadedImageUrl && (
            <div className="space-y-4">
              <p className="text-sm font-medium">{t('adminPage.copyUrlPrompt')}</p>
              <Input readOnly value={uploadedImageUrl} onFocus={(e) => e.target.select()} />
              <div className="relative aspect-video w-full max-w-sm rounded-md border overflow-hidden">
                <Image src={uploadedImageUrl} alt={t('adminPage.imagePreviewAlt')} fill className="object-contain" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminPage.grantRevokeTitle')}</CardTitle>
          <CardDescription>{t('adminPage.grantRevokeDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">{t('adminPage.userEmail')}</Label>
            <Input 
              id="admin-email" 
              type="email" 
              placeholder={t('adminPage.userEmailPlaceholder')}
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGrantAdminRole} disabled={isMakingAdmin}>
              {isMakingAdmin ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              {t('adminPage.makeAdmin')}
            </Button>
             <Button variant="destructive" onClick={handleRevokeAdminRole} disabled={isMakingAdmin}>
                {isMakingAdmin ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldOff className="mr-2 h-4 w-4" />}
                {t('adminPage.removeAdmin')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="achievements">
        <TabsList>
            <TabsTrigger value="achievements">{t('achievements')} ({achievements?.length || 0})</TabsTrigger>
            <TabsTrigger value="rewards">{t('rewards')} ({rewards?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="achievements">
            <Card>
                <CardHeader className="flex flex-row flex-wrap justify-between items-center gap-4">
                    <div>
                        <CardTitle>{t('manageAchievements')}</CardTitle>
                        <CardDescription>{t('manageAchievementsDescription')}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={handleSeedAchievements}>
                            <Database className="w-4 h-4 mr-2"/>
                            {t('adminPage.seedAchievements')}
                        </Button>
                         <AchievementFormDialog onSave={handleSaveAchievement}>
                            <Button variant="outline">
                                <PlusCircle className="w-4 h-4 mr-2"/>
                                {t('addAchievement')}
                            </Button>
                        </AchievementFormDialog>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                     {isLoading ? <Loader2 className="animate-spin" /> : (
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('name')}</TableHead>
                                        <TableHead className="hidden md:table-cell">{t('description')}</TableHead>
                                        <TableHead>{t('icon')}</TableHead>
                                        <TableHead className="text-right">{t('adminPage.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {achievements?.map((achievement) => (
                                        <TableRow key={achievement.id}>
                                            <TableCell className="font-medium">{achievement.name}</TableCell>
                                            <TableCell className="hidden md:table-cell max-w-xs truncate">{achievement.description}</TableCell>
                                            <TableCell>{achievement.icon}</TableCell>
                                            <TableCell className="flex gap-2 justify-end">
                                                 <AchievementFormDialog achievement={achievement} onSave={(data) => handleSaveAchievement({ ...data, id: achievement.id })}>
                                                    <Button type="button" variant="ghost" size="icon">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                 </AchievementFormDialog>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteAchievement(achievement.id)}>
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
                        {t('adminPage.seedRewards')}
                    </Button>
                        <Button type="button" variant="secondary" onClick={handleSeedQuests}>
                        <Database className="w-4 h-4 mr-2"/>
                        {t('adminPage.seedQuests')}
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
                                        <TableHead className="text-right">{t('adminPage.actions')}</TableHead>
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

    
    
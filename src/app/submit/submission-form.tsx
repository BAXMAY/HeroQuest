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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Send, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/language-context";
import Image from "next/image";
import { useFirebase, useUser } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


const formSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(200, {
    message: "Description must be less than 200 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  photo: z.any()
    .refine(files => files?.length == 1, 'Proof of your deed is required.')
});

type SubmissionStatus = 'draft' | 'pending';


export default function SubmissionForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<SubmissionStatus | false>(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { t } = useLanguage();
    const { firestore } = useFirebase();
    const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, fieldChange: (files: FileList | null) => void) => {
    const files = e.target.files;
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    if (files && files.length > 0) {
      const file = files[0];
      setImagePreview(URL.createObjectURL(file));
      fieldChange(files);
    } else {
      setImagePreview(null);
      fieldChange(null);
    }
  };


  const onSubmit = async (values: z.infer<typeof formSchema>, status: SubmissionStatus) => {
    if (!user || !firestore) return;
    setIsLoading(status);

    let photoUrl = '';
    const file = values.photo[0] as File;

    if(file) {
      const storage = getStorage();
      const storageRef = ref(storage, `quests/${user.uid}/${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      photoUrl = await getDownloadURL(uploadResult.ref);
    }

    const questData = {
      userProfileId: user.uid,
      description: values.description,
      category: values.category,
      photo: photoUrl,
      status: status,
      points: 50, // Default points, can be adjusted in approval
      submittedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    try {
      const questsCollection = collection(firestore, 'users', user.uid, 'volunteer_work');
      await addDocumentNonBlocking(questsCollection, questData);
      
      toast({
          title: t('questSubmitted'),
          description: status === 'pending' ? t('questSubmittedDescription') : 'Your quest has been saved as a draft.',
      });
      form.reset();
      setImagePreview(null);
      router.push('/dashboard');
    } catch(error) {
      console.error("Error submitting quest: ", error);
      toast({
        title: "Error",
        description: "There was an error submitting your quest.",
        variant: "destructive"
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('describeYourQuest')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('describePlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t('describeHint')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('category')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCategory')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="environment">สิ่งแวดล้อม (Environment)</SelectItem>
                  <SelectItem value="animals">สัตว์ (Animals)</SelectItem>
                  <SelectItem value="community">ชุมชน (Community)</SelectItem>
                  <SelectItem value="education">การศึกษา (Education)</SelectItem>
                  <SelectItem value="health">สุขภาพ (Health)</SelectItem>
                  <SelectItem value="charity">การให้ทาน (Charity)</SelectItem>
                  <SelectItem value="family">ครอบครัวและความเคารพ (Family & Respect)</SelectItem>
                  <SelectItem value="quran">การอ่านอัลกุรอาน (Quran Reading)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t('categoryHint')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('uploadProof')}</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={(e) => handlePhotoChange(e, field.onChange)} />
              </FormControl>
              <FormDescription>
                {t('uploadProofHint')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {imagePreview && (
            <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Image Preview:</p>
                <div className="relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-lg border">
                    <Image src={imagePreview} alt="Image preview" fill className="object-cover"/>
                </div>
            </div>
        )}

        <div className="flex gap-2">
            <Button type="button" onClick={form.handleSubmit(data => onSubmit(data, 'pending'))} disabled={!!isLoading}>
            {isLoading === 'pending' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Send className="mr-2 h-4 w-4" />
                )}
            {t('submitForReview')}
            </Button>
             <Button type="button" variant="outline" onClick={form.handleSubmit(data => onSubmit(data, 'draft'))} disabled={!!isLoading}>
            {isLoading === 'draft' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Save className="mr-2 h-4 w-4" />
                )}
            {t('saveAsDraft')}
            </Button>
        </div>
      </form>
    </Form>
  );
}

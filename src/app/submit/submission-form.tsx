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
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/language-context";
import Image from "next/image";


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

export default function SubmissionForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { t } = useLanguage();

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


  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log(values);

    // Simulate API call
    setTimeout(() => {
        setIsLoading(false);
        toast({
            title: t('questSubmitted'),
            description: t('questSubmittedDescription'),
        });
        form.reset();
        setImagePreview(null);
        router.push('/');
    }, 1500);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  <SelectItem value="environment">สิ่งแวดล้อม</SelectItem>
                  <SelectItem value="animals">สัตว์</SelectItem>
                  <SelectItem value="community">ชุมชน</SelectItem>
                  <SelectItem value="education">การศึกษา</SelectItem>
                  <SelectItem value="health">สุขภาพ</SelectItem>
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

        <Button type="submit" disabled={isLoading}>
           {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
          {t('submitForReview')}
        </Button>
      </form>
    </Form>
  );
}

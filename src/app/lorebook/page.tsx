'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked } from "lucide-react";
import { useLanguage } from "../context/language-context";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LorebookPage() {
  const { t } = useLanguage();
  const loreImage = PlaceHolderImages.find(img => img.id === 'loreDragon')?.imageUrl;
  return (
    <div className="space-y-8 relative">
       {loreImage && (
        <div className="absolute inset-0 top-16 -z-10 opacity-15 blur-sm">
            <Image 
                src={loreImage} 
                alt="A dragon reading a book." 
                fill 
                className="object-cover" 
                data-ai-hint="dragon reading"
            />
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
          <BookMarked className="w-8 h-8 text-primary" />
          {t('pageTitles.lorebook')}
        </h1>
        <p className="text-muted-foreground">{t('lorebookDescription')}</p>
      </div>

      <Card className="bg-background/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t('chaptersOfHeroQuest')}</CardTitle>
          <CardDescription>{t('knowledgeIsMighty')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-headline text-lg">{t('callToAdventureTitle')}</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>{t('callToAdventureContent1')}</p>
                <p>{t('callToAdventureContent2')}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="font-headline text-lg">{t('xpAndCoinsTitle')}</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>{t('xpAndCoinsContent1')}</p>
                <p>{t('xpAndCoinsContent2')}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="font-headline text-lg">{t('hallOfHeroesTitle')}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>{t('hallOfHeroesContent')}</p>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
              <AccordionTrigger className="font-headline text-lg">{t('oraclesGuidanceTitle')}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>{t('oraclesGuidanceContent')}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

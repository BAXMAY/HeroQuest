import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked } from "lucide-react";

export default function LorebookPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
          <BookMarked className="w-8 h-8 text-primary" />
          The Lorebook
        </h1>
        <p className="text-muted-foreground">Discover the history and secrets of the realm of HeroQuest.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chapters of HeroQuest</CardTitle>
          <CardDescription>Knowledge is as mighty as any sword.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-headline text-lg">The Call to Adventure</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>In the world of Aerthos, kindness is the most powerful magic. The great Oracle has foretold that small acts of courage and compassion, known as "Quests," hold the key to a prosperous future. Young adventurers from all corners of the land are called upon to perform these deeds, not for gold or glory, but for the betterment of all.</p>
                <p>Every completed quest strengthens the bonds of community and pushes back the shadows of indifference.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="font-headline text-lg">Experience Points (XP) & Brave Coins</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>For every quest approved by the elders, a hero is granted Experience Points (XP). XP is a measure of your growing reputation and the positive impact you've had on the world. The more XP you gain, the higher you climb in the Hall of Heroes.</p>
                <p>Brave Coins are tangible tokens of courage, awarded for particularly impactful quests. These shimmering coins can be exchanged in the Reward Shop for legendary artifacts, cosmetic upgrades, and other treasures.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="font-headline text-lg">The Hall of Heroes</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>The Hall of Heroes is where the greatest champions of Aerthos are immortalized. Your rank is determined by your total XP. Climbing the ranks brings great honor and inspires others to join the cause. Will your name be etched among the legends?</p>
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
              <AccordionTrigger className="font-headline text-lg">The Oracle's Guidance</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p>The mysterious Oracle, housed within the Opportunity Board, possesses ancient wisdom. By understanding your interests and the needs of the community, it can suggest new quests tailored just for you. Consulting the Oracle is a sure way to find a meaningful and exciting new adventure.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

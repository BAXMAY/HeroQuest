import { deeds } from "@/app/lib/mock-data";
import SuggestionForm from "./suggestion-form";
import { Sparkles } from "lucide-react";

export default function GalleryPage() {
  const trendingDeeds = deeds
    .filter((d) => d.status === 'approved')
    .map(({ description, category }) => ({ description, category }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-accent"/>
            Volunteer Opportunity Gallery
        </h1>
        <p className="text-muted-foreground">Discover new ways to help, suggested just for you by AI!</p>
      </div>

      <SuggestionForm trendingDeeds={trendingDeeds} />
    </div>
  );
}

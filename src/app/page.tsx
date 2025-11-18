
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currentUser, deeds } from "@/app/lib/mock-data";
import { ArrowUpRight, Award, PlusCircle, Coins } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Mascot from "@/app/components/mascot";

export default function Home() {
  const user = currentUser;
  const userDeeds = deeds
    .filter((deed) => deed.userId === user.id && deed.status === "approved")
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Mascot className="w-16 h-16 text-primary hidden sm:block" />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Greetings, Adventurer {user.name}!
          </h1>
          <p className="text-muted-foreground">
            Ready to embark on a new quest and make a difference today?
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-card to-secondary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Experience Points (XP)</CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-primary font-headline">
              {user.score.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total experience earned
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Brave Coins</CardTitle>
            <Coins className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-amber-500 font-headline">
              {user.braveCoins.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Your treasure to spend
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center bg-accent/20 border-accent/50 border-dashed">
          <CardHeader>
            <CardTitle>Log a New Quest!</CardTitle>
            <CardDescription>Every heroic deed makes the world a better place.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/submit">
                <PlusCircle className="w-5 h-5 mr-2" />
                Start a Quest
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">
          Your Completed Quests
        </h2>
        {userDeeds.length > 0 ? (
          <div className="space-y-4">
            {userDeeds.map((deed) => (
              <Card key={deed.id} className="overflow-hidden">
                <div className="flex">
                  <div className="w-1/3 h-auto relative">
                     <Image
                      src={deed.photo}
                      alt={deed.description}
                      fill
                      className="object-cover"
                      data-ai-hint="volunteer children"
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="mb-2 capitalize">{deed.category}</Badge>
                      <p className="text-sm text-muted-foreground font-medium">
                        +{deed.points} XP
                      </p>
                    </div>
                    <p className="font-semibold">{deed.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Completed on {new Date(deed.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
             <Button variant="link" asChild className="p-0 h-auto">
              <Link href="#" className="text-sm font-semibold">
                View Quest Log <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">You haven't completed any quests yet. <Link href="/submit" className="text-primary underline">Start your first one!</Link></p>
        )}
      </div>
    </div>
  );
}

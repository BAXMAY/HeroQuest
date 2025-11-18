import { currentUser, deeds } from '@/app/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Award, BarChart, Coins, Shield, Star } from 'lucide-react';

export default function ProfilePage() {
  const user = currentUser;
  const approvedDeeds = deeds.filter(d => d.userId === user.id && d.status === 'approved');
  const pendingDeeds = deeds.filter(d => d.userId === user.id && d.status === 'pending');

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="child portrait" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl font-headline">{user.name}</CardTitle>
            <CardDescription className="text-base">Level 12 Adventurer</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                    <Award className="w-6 h-6 text-yellow-500"/>
                    <p className="text-2xl font-bold font-headline">{user.score.toLocaleString()}</p>
                </div>
              <p className="text-sm text-muted-foreground">Experience Points</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                    <Coins className="w-6 h-6 text-amber-500"/>
                    <p className="text-2xl font-bold font-headline">{user.braveCoins.toLocaleString()}</p>
                </div>
              <p className="text-sm text-muted-foreground">Brave Coins</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                    <Shield className="w-6 h-6 text-green-500"/>
                    <p className="text-2xl font-bold font-headline">{approvedDeeds.length}</p>
                </div>
              <p className="text-sm text-muted-foreground">Quests Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5"/>
                Your Stats
            </CardTitle>
            <CardDescription>A summary of your heroic journey so far.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="font-medium">Quests Pending Review</p>
                <p className="font-bold text-lg">{pendingDeeds.length}</p>
            </div>
            <Separator />
             <div className="flex justify-between items-center">
                <p className="font-medium">Total XP from Quests</p>
                <p className="font-bold text-lg text-primary">{approvedDeeds.reduce((acc, deed) => acc + deed.points, 0).toLocaleString()} XP</p>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
                <p className="font-medium">Most Common Quest Category</p>
                <Badge variant="outline" className="capitalize">Community</Badge>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

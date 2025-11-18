import { users } from '@/app/lib/mock-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function LeaderboardPage() {
  const sortedUsers = [...users].sort((a, b) => b.score - a.score);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400">
            <Crown className="w-4 h-4 mr-1" />
            1st
          </Badge>
        );
      case 2:
        return (
          <Badge className="bg-gray-300 text-gray-800 hover:bg-gray-300">2nd</Badge>
        );
      case 3:
        return (
          <Badge className="bg-yellow-700/50 text-yellow-900 hover:bg-yellow-700/50">3rd</Badge>
        );
      default:
        return <span className="font-semibold text-muted-foreground">{rank}th</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Hall of Heroes
        </h1>
        <p className="text-muted-foreground">See which adventurers are leading the charge!</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-center">Rank</TableHead>
              <TableHead>Adventurer</TableHead>
              <TableHead className="text-right">XP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user, index) => (
              <TableRow key={user.id} className={index < 3 ? 'bg-card' : ''}>
                <TableCell className="text-center font-medium">
                  {getRankBadge(index + 1)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="child portrait" />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-lg text-primary">
                  {user.score.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

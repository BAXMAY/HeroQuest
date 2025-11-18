'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { currentUser } from '@/app/lib/mock-data';
import { Award, LogOut, Settings, User as UserIcon, Coins } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const pageTitles: { [key: string]: string } = {
  '/': 'Dashboard',
  '/submit': 'Start a New Quest',
  '/leaderboard': 'Hall of Heroes',
  '/approvals': 'Quest Review',
  '/gallery': 'Opportunity Board',
};

export function AppHeader() {
  const user = currentUser;
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'HeroQuest';
  
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      
      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl font-headline">{title}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-primary/50">
              <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="child portrait" />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <div className="text-xs leading-none text-muted-foreground flex items-center justify-between">
                <div className="flex items-center">
                    <Award className="w-3 h-3 mr-1 text-yellow-500"/>
                    {user.score.toLocaleString()} XP
                </div>
                <div className="flex items-center">
                    <Coins className="w-3 h-3 mr-1 text-amber-500"/>
                    {user.braveCoins.toLocaleString()}
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

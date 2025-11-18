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
import { Award, LogOut, Settings, User as UserIcon, Coins, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';


const pageTitles: { [key: string]: string } = {
  '/': 'Dashboard',
  '/submit': 'Start a New Quest',
  '/leaderboard': 'Hall of Heroes',
  '/approvals': 'Quest Review',
  '/gallery': 'Opportunity Board',
  '/rewards': 'Reward Shop',
  '/profile': 'Your Profile',
  '/settings': 'Settings',
  '/lorebook': 'Lorebook',
  '/login': 'Login',
  '/register': 'Register',
};

export function AppHeader() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc(userProfileRef);

  const pathname = usePathname();
  const title = pageTitles[pathname] || 'HeroQuest';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have successfully logged out.',
      });
      router.push('/login');
    } catch (error) {
      console.error("Logout Error: ", error);
      toast({
        title: 'Logout Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const displayName = userProfile?.firstName || user?.displayName || 'Adventurer';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      
      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl font-headline">{title}</h1>
      </div>

      {isUserLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : user && userProfile ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-primary/50">
                <AvatarImage src={userProfile.profilePicture || user.photoURL} alt={displayName} data-ai-hint="child portrait" />
                <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <div className="text-xs leading-none text-muted-foreground flex items-center justify-between pt-1">
                  <div className="flex items-center">
                      <Award className="w-3 h-3 mr-1 text-yellow-500"/>
                      {(userProfile.totalPoints || 0).toLocaleString()} XP
                  </div>
                  <div className="flex items-center">
                      <Coins className="w-3 h-3 mr-1 text-amber-500"/>
                      {0}
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild variant="outline">
          <Link href="/login">Login</Link>
        </Button>
      )}
    </header>
  );
}

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
import { Award, LogOut, Settings, User as UserIcon, Coins, Loader2, LogIn, Home, ShieldCheck, Bell, Check } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase, useAdmin, useCollection, updateDocumentNonBlocking } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { getLevelFromXP } from '@/app/lib/levels';
import { useLanguage } from '@/app/context/language-context';
import type { Notification } from '../lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';


export function AppHeader() {
  const { user, isUserLoading } = useUser();
  const { isAdmin } = useAdmin();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const notificationsRef = useMemoFirebase(() => {
    if(!user) return null;
    return collection(firestore, 'users', user.uid, 'notifications');
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);
  const { data: notifications, isLoading: isLoadingNotifications } = useCollection<Notification>(notificationsRef);
  
  const unreadNotifications = notifications?.filter(n => !n.read) || [];

  const pathname = usePathname();
  const title = t(`pageTitles.${pathname.replace('/', '') || 'home'}`);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: t('logoutToastTitle'),
        description: t('logoutToastDescription'),
      });
      router.push('/login');
    } catch (error) {
      console.error("Logout Error: ", error);
      toast({
        title: t('logoutFailedToastTitle'),
        description: t('logoutFailedToastDescription'),
        variant: 'destructive',
      });
    }
  };
  
  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'th' : 'en');
  };

  const handleMarkAllRead = async () => {
    if (!firestore || !user || !unreadNotifications.length) return;
    const batch = writeBatch(firestore);
    unreadNotifications.forEach(notif => {
        const notifRef = doc(firestore, 'users', user.uid, 'notifications', notif.id);
        batch.update(notifRef, { read: true });
    });
    await batch.commit();
  }

  const isLoading = isUserLoading || isProfileLoading || isLoadingNotifications;
  const displayName = userProfile?.firstName || user?.displayName || t('adventurer');
  const currentLevel = getLevelFromXP(userProfile?.totalPoints);
  const isAnonymous = user?.isAnonymous;


  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      
      <div className="flex-1">
         {pathname !== '/' && (
            <h1 className="text-lg font-semibold md:text-xl font-headline">{title}</h1>
        )}
      </div>

      <Button variant="outline" onClick={handleLanguageToggle} className="w-16">
        {language === 'en' ? 'EN' : 'ไทย'}
      </Button>

      {user && !user.isAnonymous && (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell />
                    {unreadNotifications.length > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{unreadNotifications.length}</Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="flex justify-between items-center">
                    Notifications
                    {unreadNotifications.length > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto p-1" onClick={handleMarkAllRead}>
                            <Check className="w-4 h-4 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications && notifications.length > 0 ? (
                    notifications.slice(0, 5).map(notif => (
                        <DropdownMenuItem key={notif.id} asChild className={cn("flex-col items-start gap-1 whitespace-normal", !notif.read && "bg-accent/50")}>
                           <Link href={notif.link || '#'}>
                                <p className="font-semibold">{notif.title}</p>
                                <p className="text-xs text-muted-foreground">{notif.description}</p>
                                {notif.createdAt && (
                                  <p className="text-xs text-muted-foreground/80 mt-1">
                                      {formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true })}
                                  </p>
                                )}
                           </Link>
                        </DropdownMenuItem>
                    ))
                ) : (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">You're all caught up!</div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
      )}


      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-primary/50">
                <AvatarImage src={userProfile?.profilePicture || user.photoURL} alt={displayName} data-ai-hint="child portrait" />
                <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">{displayName} {userProfile?.lastName}</p>
                  {isAdmin && <ShieldCheck className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">{isAnonymous ? t('anonymousUser') : user.email}</p>
                {userProfile && (
                  <>
                    <p className="text-xs font-semibold text-primary pt-1">{t(`levelNames.${currentLevel.title}` as any)}</p>
                    <div className="text-xs leading-none text-muted-foreground flex items-center justify-between">
                      <div className="flex items-center">
                          <Award className="w-3 h-3 mr-1 text-yellow-500"/>
                          {(userProfile.totalPoints || 0).toLocaleString()} XP
                      </div>
                      <div className="flex items-center">
                          <Coins className="w-3 h-3 mr-1 text-amber-500"/>
                          {(userProfile.braveCoins || 0).toLocaleString()}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                </Link>
            </DropdownMenuItem>
            {isAnonymous ? (
                 <DropdownMenuItem asChild>
                    <Link href="/register">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>{t('signUpToSave')}</span>
                    </Link>
                </DropdownMenuItem>
            ) : (
                <>
                    <DropdownMenuItem asChild>
                        <Link href="/profile">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>{t('profile')}</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>{t('settings')}</span>
                        </Link>
                    </DropdownMenuItem>
                </>
            )}

            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={handleLogout}>
              {isAnonymous ? (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>{t('login')}</span>
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild variant="outline">
          <Link href="/login">{t('login')}</Link>
        </Button>
      )}
    </header>
  );
}

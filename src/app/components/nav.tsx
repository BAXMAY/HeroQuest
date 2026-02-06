'use client';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  useSidebar,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Trophy,
  CheckSquare,
  Sparkles,
  Settings,
  BookMarked,
  ShoppingBag,
  Users,
  Map,
  Shield,
  Paintbrush,
  ChevronRight,
} from 'lucide-react';
import Logo from '@/app/components/logo';
import { useLanguage } from '@/app/context/language-context';
import { useAdmin } from '@/firebase';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';


export default function Nav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { isAdmin } = useAdmin();
  const { setOpenMobile } = useSidebar();
  const [openCollapsibles, setOpenCollapsibles] = useState<string[]>([]);


  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/submit', label: t('nav.startQuest'), icon: PlusCircle },
    { href: '/leaderboard', label: t('nav.hallOfHeroes'), icon: Users },
    { href: '/achievements', label: t('nav.trophyRoom'), icon: Trophy },
    { href: '/roadmap', label: t('nav.levelRoadmap'), icon: Map },
    { 
      label: t('nav.admin'), 
      icon: Shield, 
      admin: true,
      subItems: [
        { href: '/admin', label: 'Admin Management' },
        { href: '/approvals', label: t('nav.questReview') },
        { href: '/users', label: t('nav.classroom') },
        { href: '/artificer-studio', label: "Artificer's Studio" },
      ]
    },
    { href: '/gallery', label: t('nav.opportunityBoard'), icon: Sparkles },
    { href: '/rewards', label: t('nav.rewardShop'), icon: ShoppingBag },
    { href: '/lorebook', label: t('nav.lorebook'), icon: BookMarked },
  ];

  useEffect(() => {
    const activeCollapsible = navItems.find(item => item.subItems?.some(sub => pathname.startsWith(sub.href)));
    if (activeCollapsible && !openCollapsibles.includes(activeCollapsible.label)) {
      setOpenCollapsibles(prev => [...prev, activeCollapsible.label]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLinkClick = () => {
    setOpenMobile(false);
  }
  
  const handleToggleCollapsible = (label: string) => {
    setOpenCollapsibles(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  }

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="w-8 h-8" />
              <h2 className="text-2xl font-bold font-headline">HeroQuest</h2>
            </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            if (item.admin && !isAdmin) return null;

            if (item.subItems) {
              const isSubActive = item.subItems.some(sub => pathname.startsWith(sub.href));
              const isOpen = openCollapsibles.includes(item.label);

              return (
                <SidebarMenuItem key={item.label}>
                  <Collapsible open={isOpen} onOpenChange={() => handleToggleCollapsible(item.label)}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isSubActive}>
                        <item.icon />
                        <span>{item.label}</span>
                        <ChevronRight className={cn("ml-auto h-4 w-4 transition-transform", isOpen && "rotate-90")} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.href}>
                             <SidebarMenuSubButton asChild isActive={pathname.startsWith(subItem.href)}>
                                <Link href={subItem.href} onClick={handleLinkClick}>
                                    {subItem.label}
                                </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              )
            }

            return (
                <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                >
                    <Link href={item.href} onClick={handleLinkClick}>
                    <item.icon />
                    <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            );
           })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t('nav.settings')} isActive={pathname === '/settings'}>
                    <Link href="/settings" onClick={handleLinkClick}>
                        <Settings />
                        <span>{t('nav.settings')}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

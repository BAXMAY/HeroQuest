'use client';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter
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
} from 'lucide-react';
import Mascot from './mascot';
import { useLanguage } from '@/app/context/language-context';
import { useAdmin } from '@/firebase';


export default function Nav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { isAdmin } = useAdmin();

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/submit', label: t('nav.startQuest'), icon: PlusCircle },
    { href: '/leaderboard', label: t('nav.hallOfHeroes'), icon: Users },
    { href: '/achievements', label: t('nav.trophyRoom'), icon: Trophy },
    { href: '/roadmap', label: t('nav.levelRoadmap'), icon: Map },
    { href: '/approvals', label: t('nav.questReview'), icon: CheckSquare, admin: true },
    { href: '/admin', label: 'Admin', icon: Shield, admin: true },
    { href: '/gallery', label: t('nav.opportunityBoard'), icon: Sparkles },
    { href: '/rewards', label: t('nav.rewardShop'), icon: ShoppingBag },
    { href: '/lorebook', label: t('nav.lorebook'), icon: BookMarked },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <Link href="/" className="flex items-center gap-2">
              <Mascot className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold font-headline">HeroQuest</h2>
            </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t('nav.settings')} isActive={pathname === '/settings'}>
                    <Link href="/settings">
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

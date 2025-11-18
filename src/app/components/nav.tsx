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
} from 'lucide-react';
import Mascot from './mascot';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/submit', label: 'Start Quest', icon: PlusCircle },
  { href: '/leaderboard', label: 'Hall of Heroes', icon: Trophy },
  { href: '/approvals', label: 'Quest Review', icon: CheckSquare },
  { href: '/gallery', label: 'Opportunity Board', icon: Sparkles },
  { href: '/rewards', label: 'Reward Shop', icon: ShoppingBag },
  { href: '/lorebook', label: 'Lorebook', icon: BookMarked },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
            <Mascot className="w-8 h-8 text-primary" />
            <h2 className="text-2xl font-bold font-headline">HeroQuest</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
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
                <SidebarMenuButton asChild tooltip="Settings" isActive={pathname === '/settings'}>
                    <Link href="/settings">
                        <Settings />
                        <span>Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

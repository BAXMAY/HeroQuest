'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import Nav from '@/app/components/nav';
import { AppHeader } from '@/app/components/header';
import { useAdmin } from '@/firebase';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const adminRoutes = ['/approvals', '/leaderboard', '/admin'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isLandingPage || isAuthPage) {
    return <main>{children}</main>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <Nav />
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

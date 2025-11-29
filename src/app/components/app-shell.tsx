'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import Nav from '@/app/components/nav';
import { AppHeader } from '@/app/components/header';
import { useAdmin } from '@/firebase';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const adminRoutes = ['/approvals', '/leaderboard'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isPotentiallyAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    if (!isAdminLoading && isPotentiallyAdminRoute && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [pathname, isAdmin, isAdminLoading, isPotentiallyAdminRoute, router]);

  if (isLandingPage || isAuthPage) {
    return <main>{children}</main>;
  }
  
  if (isPotentiallyAdminRoute && !isAdmin) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
    );
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

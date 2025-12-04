'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import Nav from '@/app/components/nav';
import { AppHeader } from '@/app/components/header';
import { useAdmin } from '@/firebase';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const adminRoutes = ['/approvals', '/admin'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  
  const isLandingPage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/onboarding';

  if (isLandingPage || isAuthPage) {
    return <main>{children}</main>;
  }
  
  const isProtectedAdminRoute = adminRoutes.includes(pathname);

  useEffect(() => {
    if (!isAdminLoading && isProtectedAdminRoute && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, isAdminLoading, isProtectedAdminRoute, router]);

  if (isAdminLoading && isProtectedAdminRoute) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }
  
  // Render nothing if user is not admin and trying to access admin page, before redirect happens
  if (isProtectedAdminRoute && !isAdmin) {
    return null;
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

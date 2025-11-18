import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import Nav from '@/app/components/nav';
import { AppHeader } from '@/app/components/header';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Deeds & Cheers',
  description: 'A gamified volunteer platform for children to track their good deeds.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full">
        <SidebarProvider>
          <Sidebar>
            <Nav />
          </Sidebar>
          <SidebarInset>
            <AppHeader />
            <main className="p-4 md:p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}

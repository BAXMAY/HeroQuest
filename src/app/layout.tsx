import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { LanguageProvider } from '@/app/context/language-context';
import AppShell from './components/app-shell';
import NotificationListener from './components/notification-listener';

export const metadata: Metadata = {
  title: 'HeroQuest',
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
        <link href="https://fonts.googleapis.com/css2?family=Chonburi&family=IM+Fell+English:ital@0;1&family=Maitree&family=MedievalSharp&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full bg-background text-foreground">
        <FirebaseClientProvider>
          <LanguageProvider>
              <NotificationListener />
              <AppShell>
                {children}
              </AppShell>
          </LanguageProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

'use client';

import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, orderBy } from 'firebase/firestore';
import type { UserProfile, Deed, Achievement } from '@/app/lib/types';
import { Loader2, Award, Coins, Star, Download, Shield } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Mascot from '@/app/components/mascot';
import { getLevelFromXP } from '@/app/lib/levels';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import CustomAvatar from '../custom-avatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Dynamic Icon component
const Icon = ({ name, className }: { name: string; className: string }) => {
    const LucideIcon = (LucideIcons as any)[name] || Shield;
    return <LucideIcon className={className} />;
};


export default function PortfolioPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const portfolioRef = useRef<HTMLDivElement>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const approvedQuestsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'volunteer_work');
  }, [user, firestore]);

  const achievementsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'achievements');
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  const { data: quests, isLoading: areQuestsLoading } = useCollection<Deed>(approvedQuestsQuery);
  const { data: achievements, isLoading: areAchievementsLoading } = useCollection<Achievement>(achievementsRef);

  const handleExport = () => {
    if (portfolioRef.current) {
      html2canvas(portfolioRef.current, { 
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: null, // Use background from the element
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Calculate the height of the image in the PDF given the width is the full page width
        const imgHeightInPdf = (canvasHeight * pdfWidth) / canvasWidth;
        
        let heightLeft = imgHeightInPdf;
        let position = 0;
        
        // Add the first page
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
        heightLeft -= pdfHeight;
        
        // Add more pages if content is longer than one page
        while (heightLeft > 0) {
          position = position - pdfHeight; // Move the image up for the next page
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
          heightLeft -= pdfHeight;
        }
        
        pdf.save(`${userProfile?.firstName ?? 'Hero'}-Portfolio.pdf`);
      });
    }
  };


  const isLoading = isUserLoading || isProfileLoading || areQuestsLoading || areAchievementsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return <div>User profile not found.</div>;
  }
  
  const currentLevel = getLevelFromXP(userProfile.totalPoints);
  const displayName = userProfile.firstName || user.displayName || 'Adventurer';

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
      <div className="bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200 font-sans p-4 sm:p-8 no-print">
         <Button onClick={handleExport} className="mb-4">
           <Download className="mr-2 h-4 w-4" />
           Export as PDF
        </Button>
      </div>
      <div ref={portfolioRef} className="bg-gray-900 text-gray-100 p-6 max-w-4xl mx-auto shadow-lg print:shadow-none w-[210mm] min-h-[297mm]">
        <header className="flex flex-col sm:flex-row items-center gap-4 border-b-2 border-gray-700 pb-4 mb-4">
            <Avatar className="h-24 w-24 border-4 border-yellow-400">
                {userProfile.avatarConfig ? (
                  <CustomAvatar config={userProfile.avatarConfig} />
                ) : (
                  <>
                    <AvatarImage src={userProfile.profilePicture || user?.photoURL} alt={displayName} data-ai-hint="child portrait" />
                    <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                  </>
                )}
            </Avatar>
            <div>
                <h1 className="text-3xl font-bold text-white font-headline">{userProfile.firstName} {userProfile.lastName}</h1>
                <p className="text-lg text-yellow-400 font-semibold">{currentLevel.title}</p>
                <p className="text-sm text-gray-400">{userProfile.email}</p>
            </div>
            <div className="flex-shrink-0 ml-auto hidden sm:block">
                <Mascot className="w-20 h-20 text-red-500" />
            </div>
        </header>

        <section className="grid grid-cols-3 gap-2 text-center mb-6">
            <div className="p-2 bg-yellow-900/50 rounded-lg">
                <Award className="w-6 h-6 mx-auto text-yellow-400 mb-1"/>
                <p className="text-xl font-bold">{userProfile.totalPoints.toLocaleString()}</p>
                <p className="text-xs font-semibold text-gray-300">Total XP</p>
            </div>
             <div className="p-2 bg-amber-900/50 rounded-lg">
                <Coins className="w-6 h-6 mx-auto text-amber-400 mb-1"/>
                <p className="text-xl font-bold">{userProfile.braveCoins.toLocaleString()}</p>
                <p className="text-xs font-semibold text-gray-300">Brave Coins</p>
            </div>
             <div className="p-2 bg-green-900/50 rounded-lg">
                <Star className="w-6 h-6 mx-auto text-green-400 mb-1"/>
                <p className="text-xl font-bold">{userProfile.questsCompleted.toLocaleString()}</p>
                <p className="text-xs font-semibold text-gray-300">Quests Completed</p>
            </div>
        </section>

        <section className="mb-6">
            <h2 className="text-xl font-bold border-b-2 border-gray-700 pb-2 mb-3 font-headline text-white">Completed Quests</h2>
            <div className="space-y-3">
                {quests && quests.length > 0 ? quests.map(quest => quest.status == 'approved' ? (
                    
                    <div key={quest.id} className="flex items-start gap-3 p-2 border border-gray-700 rounded-lg bg-gray-800">
                        <div className="w-24 h-20 relative flex-shrink-0">
                            <Image src={quest.photo} alt={quest.description} fill className="rounded-md object-cover" />
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold text-sm">{quest.description}</p>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-400">Completed: {quest.submittedAt.toDate().toLocaleDateString()}</p>
                                <p className="text-xs font-bold text-yellow-400">+{quest.points} XP</p>
                            </div>
                        </div>
                    </div>
                ) : null ) : <p className="text-gray-400">No completed quests yet.</p>}
            </div>
        </section>

        <section>
            <h2 className="text-xl font-bold border-b-2 border-gray-700 pb-2 mb-3 font-headline text-white">Achievements</h2>
             <div className="flex flex-wrap gap-3">
                {achievements && achievements.length > 0 ? achievements.map(ach => (
                  <div key={ach.id} className="text-center p-2 rounded-lg border border-gray-700 bg-blue-900/50 w-24">
                    <Icon name={ach.icon} className="w-8 h-8 mx-auto text-blue-400 mb-1" />
                    <p className="text-xs font-semibold text-gray-300">{ach.name}</p>
                  </div>
                )) : <p className="text-gray-400">No achievements unlocked yet.</p>}
            </div>
        </section>

        <footer className="text-center text-xs text-gray-500 mt-6 pt-4 border-t border-gray-700">
            Generated from HeroQuest on {new Date().toLocaleDateString()}
        </footer>
      </div>
    </>
  );
}
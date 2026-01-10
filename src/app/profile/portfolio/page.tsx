'use client';

import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, orderBy } from 'firebase/firestore';
import type { UserProfile, Deed, Achievement } from '@/app/lib/types';
import { Loader2, Award, Coins, Star, Download } from 'lucide-react';
import Mascot from '@/app/components/mascot';
import { getLevelFromXP } from '@/app/lib/levels';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import CustomAvatar from '../custom-avatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    return 
    // query(
      collection(firestore, 'users', user.uid, 'volunteer_work')
    //   where('status', '==', 'approved'),
    //   orderBy('submittedAt', 'desc')
    // );
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
      html2canvas(portfolioRef.current, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth;
        const height = width / ratio;

        let position = 0;
        let heightLeft = height;

        pdf.addImage(imgData, 'PNG', 0, position, width, height);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - height;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, width, height);
            heightLeft -= pdfHeight;
        }
        pdf.save(`${userProfile?.firstName ?? 'Hero'}-Portfolio.pdf`);
      });
    }
  };


  const isLoading = isUserLoading || isProfileLoading || areQuestsLoading || areAchievementsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
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
      <div className="bg-gray-100 text-gray-800 font-sans p-4 sm:p-8 no-print">
         <Button onClick={handleExport} className="mb-4">
           <Download className="mr-2 h-4 w-4" />
           Export as PDF
        </Button>
      </div>
      <div ref={portfolioRef} className="bg-white p-8 max-w-4xl mx-auto shadow-lg print:shadow-none">
        <header className="flex flex-col sm:flex-row items-center gap-6 border-b-2 border-gray-200 pb-6 mb-6">
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
                <h1 className="text-4xl font-bold text-gray-800 font-headline">{userProfile.firstName} {userProfile.lastName}</h1>
                <p className="text-xl text-yellow-600 font-semibold">{currentLevel.title}</p>
                <p className="text-sm text-gray-500">{userProfile.email}</p>
            </div>
            <div className="flex-shrink-0 ml-auto hidden sm:block">
                <Mascot className="w-20 h-20 text-red-600" />
            </div>
        </header>

        <section className="grid grid-cols-3 gap-4 text-center mb-8">
            <div className="p-4 bg-yellow-100 rounded-lg">
                <Award className="w-8 h-8 mx-auto text-yellow-600 mb-1"/>
                <p className="text-2xl font-bold">{userProfile.totalPoints.toLocaleString()}</p>
                <p className="text-sm font-semibold text-gray-600">Total XP</p>
            </div>
             <div className="p-4 bg-amber-100 rounded-lg">
                <Coins className="w-8 h-8 mx-auto text-amber-600 mb-1"/>
                <p className="text-2xl font-bold">{userProfile.braveCoins.toLocaleString()}</p>
                <p className="text-sm font-semibold text-gray-600">Brave Coins</p>
            </div>
             <div className="p-4 bg-green-100 rounded-lg">
                <Star className="w-8 h-8 mx-auto text-green-600 mb-1"/>
                <p className="text-2xl font-bold">{userProfile.questsCompleted.toLocaleString()}</p>
                <p className="text-sm font-semibold text-gray-600">Quests Completed</p>
            </div>
        </section>

        <section className="mb-8">
            <h2 className="text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4 font-headline">Completed Quests</h2>
            <div className="space-y-4">
                {quests && quests.length > 0 ? quests.map(quest => (
                    <div key={quest.id} className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50">
                        <div className="w-32 h-24 relative flex-shrink-0">
                            <Image src={quest.photo} alt={quest.description} fill className="rounded-md object-cover" />
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold">{quest.description}</p>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-sm text-gray-500">Completed: {quest.submittedAt.toDate().toLocaleDateString()}</p>
                                <p className="text-sm font-bold text-yellow-600">+{quest.points} XP</p>
                            </div>
                        </div>
                    </div>
                )) : <p className="text-gray-500">No completed quests yet.</p>}
            </div>
        </section>

        <section>
            <h2 className="text-2xl font-bold border-b-2 border-gray-200 pb-2 mb-4 font-headline">Achievements</h2>
             <div className="flex flex-wrap gap-4">
                {achievements && achievements.length > 0 ? achievements.map(ach => (
                  <div key={ach.id} className="text-center p-3 rounded-lg border bg-blue-50 w-28">
                    <Award className="w-10 h-10 mx-auto text-blue-500 mb-1" />
                    <p className="text-xs font-semibold text-gray-700">{ach.name}</p>
                  </div>
                )) : <p className="text-gray-500">No achievements unlocked yet.</p>}
            </div>
        </section>

        <footer className="text-center text-xs text-gray-400 mt-8 pt-4 border-t">
            Generated from HeroQuest on {new Date().toLocaleDateString()}
        </footer>
      </div>
    </>
  );
}

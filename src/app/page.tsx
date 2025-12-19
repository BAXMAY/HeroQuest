'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Shield, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from './context/language-context';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const { t } = useLanguage();
  const mainRef = useRef<HTMLDivElement>(null);
  
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero1')?.imageUrl || 'https://picsum.photos/seed/hero1/1200/800';
  const featureImage1 = PlaceHolderImages.find(img => img.id === 'deed1')?.imageUrl || 'https://picsum.photos/seed/deed1/600/400';
  const featureImage2 = PlaceHolderImages.find(img => img.id === 'deed7')?.imageUrl || 'https://picsum.photos/seed/deed7/600/400';
  const featureImage3 = PlaceHolderImages.find(img => img.id === 'reward1')?.imageUrl || 'https://picsum.photos/seed/reward1/600/400';
  const xpCoinIcon = PlaceHolderImages.find(img => img.id === 'xp-coin-icon')?.imageUrl;


  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate feature cards
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 80%",
        },
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 0.8,
      });

      // Animate visual callouts
      const visualCallouts = gsap.utils.toArray<HTMLElement>('.visual-callout');
      visualCallouts.forEach(callout => {
        gsap.from(callout, {
          scrollTrigger: {
            trigger: callout,
            start: "top 85%",
          },
          opacity: 0,
          y: 50,
          duration: 1,
        });
      });

      // Animate final CTA
      gsap.from(".final-cta", {
        scrollTrigger: {
          trigger: ".final-cta",
          start: "top 90%",
        },
        opacity: 0,
        scale: 0.95,
        duration: 1,
      });

    }, mainRef);

    return () => ctx.revert(); // Cleanup
  }, []);


  return (
    <div ref={mainRef} className="space-y-16 md:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center text-center text-white bg-black h-[60vh] md:h-[75vh]">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="Children volunteering"
            fill
            className="object-cover opacity-50"
            priority
            data-ai-hint="children volunteering"
          />
        </div>
        <div className="relative z-10 p-4 flex flex-col items-center space-y-6">
          {xpCoinIcon && (
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <Image src={xpCoinIcon} alt="XP and Coins Icon" layout="fill" className="object-contain" />
            </div>
          )}
          
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg">
            <Link href="/register">
              {t('joinAdventure')} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 md:px-6 features-section">
        <h2 className="text-3xl md:text-4xl font-bold text-center font-headline mb-12">
          {t('anAdventureInEveryGoodDeed')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center feature-card">
            <CardContent className="p-6">
              {xpCoinIcon ? (
                <div className="relative w-12 h-12 mx-auto mb-4">
                    <Image src={xpCoinIcon} alt="XP and Coins Icon" fill className="object-contain" />
                </div>
              ) : (
                <Users className="w-12 h-12 mx-auto text-primary mb-4" />
              )}
              <h3 className="text-xl font-bold font-headline mb-2">{t('earnXPAndCoins')}</h3>
              <p className="text-muted-foreground">
                {t('earnXPAndCoinsDescription')}
              </p>
            </CardContent>
          </Card>
          <Card className="text-center feature-card">
            <CardContent className="p-6">
              <Users className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-bold font-headline mb-2">{t('climbTheRanks')}</h3>
              <p className="text-muted-foreground">
                {t('climbTheRanksDescription')}
              </p>
            </CardContent>
          </Card>
          <Card className="text-center feature-card">
            <CardContent className="p-6">
              <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-bold font-headline mb-2">{t('unlockAchievements')}</h3>
              <p className="text-muted-foreground">
                {t('unlockAchievementsDescription')}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Visual Feature Callouts */}
       <section className="container mx-auto px-4 md:px-6 space-y-16">
        <div className="grid md:grid-cols-2 gap-8 items-center visual-callout">
          <div className="order-2 md:order-1">
             <h3 className="text-2xl font-bold font-headline mb-4">{t('logYourQuests')}</h3>
             <p className="text-muted-foreground mb-4">{t('logYourQuestsDescription')}</p>
             <Button asChild variant="outline">
                <Link href="/submit">{t('startAQuest')}</Link>
             </Button>
          </div>
          <div className="order-1 md:order-2">
            <Image src={featureImage1} alt="Quest logging" width={600} height={400} className="rounded-lg shadow-xl" data-ai-hint="child planting tree"/>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center visual-callout">
          <div>
            <Image src={featureImage2} alt="Leaderboard" width={600} height={400} className="rounded-lg shadow-xl" data-ai-hint="kids teamwork"/>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-headline mb-4">{t('becomeALegend')}</h3>
            <p className="text-muted-foreground mb-4">{t('becomeALegendDescription')}</p>
             <Button asChild variant="outline">
                <Link href="/leaderboard">{t('viewHallOfHeroes')}</Link>
             </Button>
          </div>
        </div>
         <div className="grid md:grid-cols-2 gap-8 items-center visual-callout">
          <div className="order-2 md:order-1">
             <h3 className="text-2xl font-bold font-headline mb-4">{t('claimYourRewards')}</h3>
             <p className="text-muted-foreground mb-4">{t('claimYourRewardsDescription')}</p>
             <Button asChild variant="outline">
                <Link href="/rewards">{t('visitTheShop')}</Link>
             </Button>
          </div>
          <div className="order-1 md:order-2">
            <Image src={featureImage3} alt="Rewards" width={600} height={400} className="rounded-lg shadow-xl" data-ai-hint="toy collection"/>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 md:px-6 text-center">
        <Card className="bg-primary/10 border-primary/20 p-8 final-cta">
            <h2 className="text-3xl font-bold font-headline mb-4">{t('readyToBeAHerp')}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">{t('readyToBecomeAHeroDescription')}</p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg">
                <Link href="/register">
                {t('joinTheGuildNow')}
                </Link>
            </Button>
        </Card>
      </section>

      <footer className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground mt-8 border-t pt-8">
        © 2024 HeroQuest Creator. All Rights Reserved.
      </footer>
    </div>
  );
}

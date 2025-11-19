'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Award, Shield, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Mascot from '@/app/components/mascot';
import { useLanguage } from './context/language-context';

export default function LandingPage() {
  const { t } = useLanguage();
  const heroImage = PlaceHolderImages.find(img => img.id === 'deed4')?.imageUrl || 'https://picsum.photos/seed/deed4/1200/800';
  const featureImage1 = PlaceHolderImages.find(img => img.id === 'deed1')?.imageUrl || 'https://picsum.photos/seed/deed1/600/400';
  const featureImage2 = PlaceHolderImages.find(img => img.id === 'deed2')?.imageUrl || 'https://picsum.photos/seed/deed2/600/400';
  const featureImage3 = PlaceHolderImages.find(img => img.id === 'reward1')?.imageUrl || 'https://picsum.photos/seed/reward1/600/400';


  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white bg-black">
        <Image
          src={heroImage}
          alt="Children volunteering"
          fill
          className="object-cover opacity-50"
          priority
          data-ai-hint="children volunteering"
        />
        <div className="relative z-10 p-4 space-y-4">
          <div className="flex justify-center">
            <Mascot className="w-24 h-24 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-wider text-shadow-lg">
            HeroQuest
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-shadow">
            {t('submitDescription')}
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg">
            <Link href="/register">
              {t('joinAdventure')} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center font-headline mb-12">
          {t('anAdventureInEveryGoodDeed')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <Award className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-bold font-headline mb-2">{t('earnXPAndCoins')}</h3>
              <p className="text-muted-foreground">
                {t('earnXPAndCoinsDescription')}
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-bold font-headline mb-2">{t('climbTheRanks')}</h3>
              <p className="text-muted-foreground">
                {t('climbTheRanksDescription')}
              </p>
            </CardContent>
          </Card>
          <Card className="text-center">
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
        <div className="grid md:grid-cols-2 gap-8 items-center">
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
        <div className="grid md:grid-cols-2 gap-8 items-center">
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
         <div className="grid md:grid-cols-2 gap-8 items-center">
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
        <Card className="bg-primary/10 border-primary/20 p-8">
            <h2 className="text-3xl font-bold font-headline mb-4">{t('readyToBeAHerp')}</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">{t('readyToBecomeAHeroDescription')}</p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg">
                <Link href="/register">
                {t('joinTheGuildNow')}
                </Link>
            </Button>
        </Card>
      </section>

    </div>
  );
}

'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Brush, ShieldQuestion } from "lucide-react";
import { useLanguage } from "../context/language-context";

export default function SettingsPage() {
    const { t } = useLanguage();
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">{t('pageTitles.settings')}</h1>
            <p className="text-muted-foreground">{t('settingsDescription')}</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5"/>
                    {t('notifications')}
                </CardTitle>
                <CardDescription>{t('notificationsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                    <div>
                        <Label htmlFor="quest-updates" className="font-medium">{t('questUpdates')}</Label>
                        <p className="text-sm text-muted-foreground">{t('questUpdatesDescription')}</p>
                    </div>
                    <Switch id="quest-updates" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                    <div>
                        <Label htmlFor="weekly-summary" className="font-medium">{t('weeklySummary')}</Label>
                        <p className="text-sm text-muted-foreground">{t('weeklySummaryDescription')}</p>
                    </div>
                    <Switch id="weekly-summary" />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brush className="w-5 h-5"/>
                    {t('appearance')}
                </CardTitle>
                <CardDescription>{t('appearanceDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                    <div>
                        <Label htmlFor="dark-mode" className="font-medium">{t('darkMode')}</Label>
                        <p className="text-sm text-muted-foreground">{t('darkModeDescription')}</p>
                    </div>
                    <Switch id="dark-mode" onClick={() => document.documentElement.classList.toggle('dark')} />
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldQuestion className="w-5 h-5"/>
                    {t('support')}
                </CardTitle>
                <CardDescription>{t('supportDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('supportContent') }} />
            </CardContent>
        </Card>
    </div>
  );
}

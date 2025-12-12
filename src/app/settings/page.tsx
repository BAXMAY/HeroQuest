'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Brush, ShieldQuestion, Code } from "lucide-react";
import { useLanguage } from "../context/language-context";
import { Button } from "@/components/ui/button";
import { useUser, useFirebase, updateDocumentNonBlocking, useDoc, useMemoFirebase } from "@/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { doc } from "firebase/firestore";
import type { UserProfile } from "@/app/lib/types";

export default function SettingsPage() {
    const { t } = useLanguage();
    const { user } = useUser();
    const { firebaseApp, firestore } = useFirebase();
    const { toast } = useToast();
    const [isMakingAdmin, setIsMakingAdmin] = useState(false);

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const handleMakeAdmin = async () => {
        if (!user || !user.email) {
            toast({
                title: "Error",
                description: "You must be logged in with an email to become an admin.",
                variant: "destructive"
            });
            return;
        }

        setIsMakingAdmin(true);
        try {
            const functions = getFunctions(firebaseApp);
            const addAdminRole = httpsCallable(functions, 'addAdminRole');
            const result = await addAdminRole({ email: user.email });
            console.log(result.data);
            toast({
                title: "Admin Privileges Granted!",
                description: "Please refresh the page for the changes to take effect.",
            });
        } catch (error: any) {
            console.error("Error granting admin role: ", error);
            toast({
                title: "Error",
                description: error.message || "Could not grant admin privileges.",
                variant: "destructive"
            });
        } finally {
            setIsMakingAdmin(false);
        }
    };

    const handleNotificationChange = (key: 'questUpdates' | 'weeklySummary', value: boolean) => {
        if (!userProfileRef) return;
        updateDocumentNonBlocking(userProfileRef, {
            [`settings.notifications.${key}`]: value
        });
    };

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
                    <Switch 
                        id="quest-updates" 
                        checked={userProfile?.settings?.notifications?.questUpdates ?? true} 
                        onCheckedChange={(checked) => handleNotificationChange('questUpdates', checked)}
                    />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                    <div>
                        <Label htmlFor="weekly-summary" className="font-medium">{t('weeklySummary')}</Label>
                        <p className="text-sm text-muted-foreground">{t('weeklySummaryDescription')}</p>
                    </div>
                    <Switch 
                        id="weekly-summary" 
                        checked={userProfile?.settings?.notifications?.weeklySummary ?? false}
                        onCheckedChange={(checked) => handleNotificationChange('weeklySummary', checked)}
                     />
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

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5"/>
                    Developer Tools
                </CardTitle>
                <CardDescription>Settings for development and testing purposes.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button onClick={handleMakeAdmin} disabled={isMakingAdmin}>
                    {isMakingAdmin ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Code className="mr-2 h-4 w-4" />
                    )}
                    Grant Admin Privileges
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}

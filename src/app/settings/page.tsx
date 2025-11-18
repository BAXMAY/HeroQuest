'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Brush, ShieldQuestion } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5"/>
                    Notifications
                </CardTitle>
                <CardDescription>Choose how you want to be notified about your quests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                    <div>
                        <Label htmlFor="quest-updates" className="font-medium">Quest Updates</Label>
                        <p className="text-sm text-muted-foreground">Receive emails when your quest status changes.</p>
                    </div>
                    <Switch id="quest-updates" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                    <div>
                        <Label htmlFor="weekly-summary" className="font-medium">Weekly Summary</Label>
                        <p className="text-sm text-muted-foreground">Get a weekly digest of your adventures.</p>
                    </div>
                    <Switch id="weekly-summary" />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brush className="w-5 h-5"/>
                    Appearance
                </CardTitle>
                <CardDescription>Customize the look and feel of your HeroQuest journey.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background border">
                    <div>
                        <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Embrace the shadows for your interface.</p>
                    </div>
                    <Switch id="dark-mode" onClick={() => document.documentElement.classList.toggle('dark')} />
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldQuestion className="w-5 h-5"/>
                    Support
                </CardTitle>
                <CardDescription>Need help on your quest? Find it here.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    If you encounter a bug or have a question, please contact the Guild Masters at <a href="mailto:support@heroquest.com" className="text-primary underline">support@heroquest.com</a>.
                </p>
            </CardContent>
        </Card>
    </div>
  );
}

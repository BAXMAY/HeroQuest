'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SubmissionForm from "./submission-form";
import { useLanguage } from "../context/language-context";

export default function SubmitPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('submitNewQuest')}</h1>
        <p className="text-muted-foreground">{t('submitDescription')}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('newQuestDetails')}</CardTitle>
          <CardDescription>{t('newQuestDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
            <SubmissionForm />
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SubmissionForm from "./submission-form";

export default function SubmitPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Start a New Quest</h1>
        <p className="text-muted-foreground">Tell us about the heroic deed you've accomplished!</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New Quest Details</CardTitle>
          <CardDescription>Fill out the form below. Each approved quest earns you XP!</CardDescription>
        </CardHeader>
        <CardContent>
            <SubmissionForm />
        </CardContent>
      </Card>
    </div>
  );
}

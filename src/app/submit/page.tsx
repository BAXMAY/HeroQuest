import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SubmissionForm from "./submission-form";

export default function SubmitPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Submit a Good Deed</h1>
        <p className="text-muted-foreground">Tell us about the awesome work you've done!</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New Deed Details</CardTitle>
          <CardDescription>Fill out the form below. Each approved deed earns you points!</CardDescription>
        </CardHeader>
        <CardContent>
            <SubmissionForm />
        </CardContent>
      </Card>
    </div>
  );
}

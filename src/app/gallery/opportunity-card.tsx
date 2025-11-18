import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { VolunteerOpportunity } from '@/app/lib/types';
import { HandsHelpingIcon, PawPrintIcon } from '../components/icons';
import { Recycle, BookOpen, HeartPulse } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: VolunteerOpportunity;
}

const categoryIcons: { [key: string]: React.ElementType } = {
  animals: PawPrintIcon,
  environment: Recycle,
  community: HandsHelpingIcon,
  education: BookOpen,
  health: HeartPulse,
};

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const Icon = categoryIcons[opportunity.category.toLowerCase()] || HandsHelpingIcon;

  return (
    <Card className="flex flex-col bg-card hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg pr-4">{opportunity.title}</CardTitle>
            <div className="p-2 bg-accent/20 rounded-full">
                <Icon className="w-6 h-6 text-accent-foreground" />
            </div>
        </div>
        <Badge variant="outline" className="capitalize w-fit">{opportunity.category}</Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{opportunity.description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
}

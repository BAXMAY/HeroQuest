export type User = {
  id: string;
  name: string;
  avatar: string;
  score: number;
};

export type Deed = {
  id: string;
  userId: string;
  description: string;
  photo: string;
  points: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  category: string;
};

export type VolunteerOpportunity = {
  title: string;
  description:string;
  category: string;
};

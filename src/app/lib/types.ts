// This represents the user profile document stored in Firestore
export type UserProfile = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  profilePicture?: string;
  totalPoints: number;
  braveCoins: number;
  questsCompleted: number;
};

// This represents a "deed" or "quest" submission document in Firestore
export type Deed = {
  id: string;
  userId: string;
  description: string;
  photo: string;
  points: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string; // Should be ISO8601 string
  category: string;
};

// This is an AI-generated type, not stored in Firestore
export type VolunteerOpportunity = {
  title: string;
  description:string;
  category: string;
};

// This is based on mock-data for now
export type Reward = {
  id: string;
  name: string;
  description: string;
  cost: number;
  image: string;
};

// This represents an achievement document in Firestore
export type Achievement = {
  id: string; // This will be the document ID
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string; // Should be ISO8601 string
};

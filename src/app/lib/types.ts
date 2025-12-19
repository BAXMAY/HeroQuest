'use client';
import type { Timestamp } from 'firebase/firestore';

export type AvatarConfig = {
  skinColor: string;
  hairStyle: 'short' | 'long' | 'bald';
  hairColor: string;
  eyeStyle: 'normal' | 'happy' | 'wink';
  shirtStyle: 'crew' | 'polo';
  shirtColor: string;
  accessory: 'none' | 'glasses';
};


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
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  settings?: {
    notifications?: {
      questUpdates?: boolean;
      weeklySummary?: boolean;
    }
  }
  avatarConfig?: AvatarConfig;
};

// This represents a "deed" or "quest" submission document in Firestore
export type Deed = {
  id: string;
  userProfileId: string;
  description: string;
  photo: string;
  points: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  submittedAt: Timestamp;
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

// Represents a reward that a user has redeemed
export type RedeemedReward = {
  id: string; // Document ID
  rewardId: string;
  name: string;
  cost: number;
  image: string;
  redeemedAt: Timestamp;
  status: 'processing' | 'shipped' | 'delivered';
}

// Represents a notification for a user
export type Notification = {
  id: string; // Document ID
  title: string;
  description: string;
  createdAt: Timestamp;
  read: boolean;
  type: 'quest_approved' | 'achievement_unlocked';
  link?: string;
};

import type { User, Deed, Reward } from './types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || `https://picsum.photos/seed/${id}/400/300`;

export const users: User[] = [
  { id: 'user-1', name: 'Alex', avatar: getImage('avatar1'), score: 1250, braveCoins: 125 },
  { id: 'user-2', name: 'Mia', avatar: getImage('avatar2'), score: 1100, braveCoins: 110 },
  { id: 'user-3', name: 'Ben', avatar: getImage('avatar3'), score: 950, braveCoins: 95 },
  { id: 'user-4', name: 'Chloe', avatar: getImage('avatar4'), score: 875, braveCoins: 87 },
  { id: 'user-5', name: 'Sam', avatar: getImage('avatar5'), score: 700, braveCoins: 70 },
];

export const currentUser = users[0];

export const deeds: Deed[] = [
  {
    id: 'deed-1',
    userId: 'user-1',
    description: 'Helped clean up the local park and collected two bags of trash.',
    photo: getImage('deed1'),
    points: 50,
    status: 'approved',
    submittedAt: '2024-05-20T10:00:00Z',
    category: 'environment',
  },
  {
    id: 'deed-2',
    userId: 'user-2',
    description: 'Walked dogs at the animal shelter for a whole afternoon.',
    photo: getImage('deed2'),
    points: 75,
    status: 'approved',
    submittedAt: '2024-05-19T14:30:00Z',
    category: 'animals',
  },
  {
    id: 'deed-3',
    userId: 'user-3',
    description: 'Planted new flowers in the community garden.',
    photo: getImage('deed3'),
    points: 40,
    status: 'approved',
    submittedAt: '2024-05-21T09:00:00Z',
    category: 'community',
  },
  {
    id: 'deed-4',
    userId: 'user-1',
    description: 'Organized a book drive for the local library and collected over 50 books.',
    photo: getImage('deed4'),
    points: 100,
    status: 'approved',
    submittedAt: '2024-05-18T11:00:00Z',
    category: 'education',
  },
  {
    id: 'deed-5',
    userId: 'user-4',
    description: 'Sorted cans at the local food bank.',
    photo: getImage('deed5'),
    points: 60,
    status: 'pending',
    submittedAt: '2024-05-22T16:00:00Z',
    category: 'community',
  },
  {
    id: 'deed-6',
    userId: 'user-5',
    description: 'Read stories to residents at the elderly home.',
    photo: getImage('deed6'),
    points: 80,
    status: 'pending',
    submittedAt: '2024-05-23T15:00:00Z',
    category: 'community',
  },
  {
    id: 'deed-7',
    userId: 'user-2',
    description: 'Participated in a 5K charity run for clean water.',
    photo: getImage('deed7'),
    points: 120,
    status: 'approved',
    submittedAt: '2024-05-15T08:00:00Z',
    category: 'health',
  },
];

export const rewards: Reward[] = [
  {
    id: 'reward-1',
    name: 'Dragon\'s Hoard Sticker Pack',
    description: 'A collection of shiny, holographic dragon stickers.',
    cost: 50,
    image: getImage('reward1'),
  },
  {
    id: 'reward-2',
    name: 'Enchanted Seed Pouch',
    description: 'Plant a mystery seed and see what magical plant grows!',
    cost: 100,
    image: getImage('reward2'),
  },
  {
    id: 'reward-3',
    name: 'Hero\'s Cape (Cosmetic)',
    description: 'A cool digital cape for your online avatar.',
    cost: 250,
    image: getImage('reward3'),
  },
  {
    id: 'reward-4',
    name: 'Scroll of Knowledge',
    description: 'Unlock a fun fact about ancient heroes and their deeds.',
    cost: 75,
    image: getImage('reward4'),
  },
  {
    id: 'reward-5',
    name: 'Mascot\'s Blessing',
    description: 'Get a personalized cheer from our very own mascot!',
    cost: 150,
    image: getImage('reward5'),
  },
  {
    id: 'reward-6',
    name: 'Legendary Title: "The Kind"',
    description: 'Display this title next to your name on the leaderboard.',
    cost: 500,
    image: getImage('reward6'),
  },
];

import type { User, Deed } from './types';

export const users: User[] = [
  { id: 'user-1', name: 'Alex', avatar: 'https://picsum.photos/seed/userAlex/100/100', score: 1250 },
  { id: 'user-2', name: 'Mia', avatar: 'https://picsum.photos/seed/userMia/100/100', score: 1100 },
  { id: 'user-3', name: 'Ben', avatar: 'https://picsum.photos/seed/userBen/100/100', score: 950 },
  { id: 'user-4', name: 'Chloe', avatar: 'https://picsum.photos/seed/userChloe/100/100', score: 875 },
  { id: 'user-5', name: 'Sam', avatar: 'https://picsum.photos/seed/userSam/100/100', score: 700 },
];

export const currentUser = users[0];

export const deeds: Deed[] = [
  {
    id: 'deed-1',
    userId: 'user-1',
    description: 'Helped clean up the local park and collected two bags of trash.',
    photo: 'https://picsum.photos/seed/deedPark/400/300',
    points: 50,
    status: 'approved',
    submittedAt: '2024-05-20T10:00:00Z',
    category: 'environment',
  },
  {
    id: 'deed-2',
    userId: 'user-2',
    description: 'Walked dogs at the animal shelter for a whole afternoon.',
    photo: 'https://picsum.photos/seed/deedAnimal/400/300',
    points: 75,
    status: 'approved',
    submittedAt: '2024-05-19T14:30:00Z',
    category: 'animals',
  },
  {
    id: 'deed-3',
    userId: 'user-3',
    description: 'Planted new flowers in the community garden.',
    photo: 'https://picsum.photos/seed/deedGarden/400/300',
    points: 40,
    status: 'approved',
    submittedAt: '2024-05-21T09:00:00Z',
    category: 'community',
  },
  {
    id: 'deed-4',
    userId: 'user-1',
    description: 'Organized a book drive for the local library and collected over 50 books.',
    photo: 'https://picsum.photos/seed/deedBook/400/300',
    points: 100,
    status: 'approved',
    submittedAt: '2024-05-18T11:00:00Z',
    category: 'education',
  },
  {
    id: 'deed-5',
    userId: 'user-4',
    description: 'Sorted cans at the local food bank.',
    photo: 'https://picsum.photos/seed/deedFoodBank/400/300',
    points: 60,
    status: 'pending',
    submittedAt: '2024-05-22T16:00:00Z',
    category: 'community',
  },
  {
    id: 'deed-6',
    userId: 'user-5',
    description: 'Read stories to residents at the elderly home.',
    photo: 'https://picsum.photos/seed/deedElderly/400/300',
    points: 80,
    status: 'pending',
    submittedAt: '2024-05-23T15:00:00Z',
    category: 'community',
  },
  {
    id: 'deed-7',
    userId: 'user-2',
    description: 'Participated in a 5K charity run for clean water.',
    photo: 'https://picsum.photos/seed/deedRun/400/300',
    points: 120,
    status: 'approved',
    submittedAt: '2024-05-15T08:00:00Z',
    category: 'health',
  },
];

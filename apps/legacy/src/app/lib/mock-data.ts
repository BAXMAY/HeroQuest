import type { User, Deed, Reward, Achievement } from './types';
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
    name: 'ชุดบอร์ดเกมสำหรับกลางคืน',
    description: 'เกมกระดานสนุกๆ สำหรับเล่นกับครอบครัวและเพื่อนๆ',
    cost: 300,
    image: getImage('reward1'),
  },
  {
    id: 'reward-2',
    name: 'ชุดทำพิซซ่า DIY',
    description: 'ทุกสิ่งที่คุณต้องการสำหรับทำพิซซ่าอร่อยๆ ด้วยกัน',
    cost: 200,
    image: getImage('reward2'),
  },
  {
    id: 'reward-3',
    name: 'แพ็คเกจคืนดูหนัง',
    description: 'ป๊อปคอร์น ขนม และหนังสำหรับสนุกกับคนที่คุณรัก',
    cost: 150,
    image: getImage('reward3'),
  },
  {
    id: 'reward-4',
    name: 'ชุดทำไอศกรีมซันเดย์',
    description: 'สร้างไอศกรีมซันเดย์สุดวิเศษของคุณเองที่บ้าน',
    cost: 100,
    image: getImage('reward4'),
  },
  {
    id: 'reward-5',
    name: 'กล่องศิลปะและงานฝีมือ',
    description: 'กล่องที่เต็มไปด้วยอุปกรณ์สร้างสรรค์สำหรับเซสชั่นศิลปะของครอบครัว',
    cost: 250,
    image: getImage('reward5'),
  },
  {
    id: 'reward-6',
    name: 'ชุดปิกนิกกลางแจ้ง',
    description: 'ตะกร้าและผ้าห่มน่ารักๆ สำหรับปิกนิกครอบครัวที่สมบูรณ์แบบ',
    cost: 350,
    image: getImage('reward6'),
  },
];

export const allAchievements: Achievement[] = [
    {
        id: 'first-quest',
        name: 'First Quest',
        description: 'Complete your very first quest.',
        icon: 'Shield',
    },
    {
        id: 'earth-guardian',
        name: 'Earth Guardian',
        description: 'Complete 3 environment-related quests.',
        icon: 'Sprout',
    },
    {
        id: 'animal-friend',
        name: 'Animal Friend',
        description: 'Complete 3 quests helping animals.',
        icon: 'Dog',
    },
    {
        id: 'community-pillar',
        name: 'Community Pillar',
        description: 'Complete 5 community quests.',
        icon: 'Users',
    },
    {
        id: 'book-worm',
        name: 'Book Worm',
        description: 'Complete 3 education quests.',
        icon: 'BookOpen',
    },
    {
        id: 'health-hero',
        name: 'Health Hero',
        description: 'Complete 3 health-related quests.',
        icon: 'HeartPulse',
    },
    {
        id: 'jack-of-all-deeds',
        name: 'Jack of All Deeds',
        description: 'Complete a quest in every category.',
        icon: 'Shapes',
    },
    {
        id: 'xp-novice',
        name: 'XP Novice',
        description: 'Earn 100 total XP.',
        icon: 'Star',
    },
    {
        id: 'quest-enthusiast',
        name: 'Quest Enthusiast',
        description: 'Complete 5 total quests.',
        icon: 'Swords',
    },
    {
        id: 'xp-master',
        name: 'XP Master',
        description: 'Earn 1000 total XP.',
        icon: 'Gem',
    },
    {
        id: 'xp-grandmaster',
        name: 'XP Grandmaster',
        description: 'Earn 5000 total XP.',
        icon: 'BrainCircuit',
    },
    {
        id: 'legendary-hero',
        name: 'Legendary Hero',
        description: 'Complete 20 total quests.',
        icon: 'Crown',
    },
];

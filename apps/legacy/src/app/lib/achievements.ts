import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import type { Achievement, Deed, UserProfile } from "./types";
import { getSdks } from "@/firebase";
import { getAuth } from "firebase/auth";

export async function checkAndAwardAchievements(userProfile: UserProfile) {
    const auth = getAuth();
    if (!auth.app) return;
    const { firestore } = getSdks(auth.app);
    
    // 1. Get all possible achievements
    const allAchievementsSnapshot = await getDocs(collection(firestore, 'achievements'));
    const allAchievements = allAchievementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));

    // 2. Get user's completed quests
    const userQuestsSnapshot = await getDocs(collection(firestore, 'users', userProfile.id, 'volunteer_work'));
    const userQuests = userQuestsSnapshot.docs.map(doc => doc.data() as Deed);
    const approvedQuests = userQuests.filter(q => q.status === 'approved');

    // 3. Get user's current achievements
    const userAchievementsSnapshot = await getDocs(collection(firestore, 'users', userProfile.id, 'achievements'));
    const unlockedAchievementIds = new Set(userAchievementsSnapshot.docs.map(doc => doc.id));

    const newAchievements: Achievement[] = [];
    const batch = writeBatch(firestore);

    // 4. Check each achievement
    allAchievements.forEach(achievement => {
        if (unlockedAchievementIds.has(achievement.id)) {
            return; // Already unlocked
        }

        let isUnlocked = false;

        switch (achievement.id) {
            case 'first-quest':
                if (userProfile.questsCompleted >= 1) isUnlocked = true;
                break;
            case 'quest-enthusiast':
                if (userProfile.questsCompleted >= 5) isUnlocked = true;
                break;
            case 'legendary-hero':
                if (userProfile.questsCompleted >= 20) isUnlocked = true;
                break;
            case 'xp-novice':
                if (userProfile.totalPoints >= 100) isUnlocked = true;
                break;
            case 'xp-master':
                if (userProfile.totalPoints >= 1000) isUnlocked = true;
                break;
            case 'xp-grandmaster':
                 if (userProfile.totalPoints >= 5000) isUnlocked = true;
                break;
            case 'earth-guardian':
                if (approvedQuests.filter(q => q.category === 'environment').length >= 3) isUnlocked = true;
                break;
            case 'animal-friend':
                if (approvedQuests.filter(q => q.category === 'animals').length >= 3) isUnlocked = true;
                break;
            case 'community-pillar':
                if (approvedQuests.filter(q => q.category === 'community').length >= 5) isUnlocked = true;
                break;
            case 'book-worm':
                if (approvedQuests.filter(q => q.category === 'education').length >= 3) isUnlocked = true;
                break;
            case 'health-hero':
                if (approvedQuests.filter(q => q.category === 'health').length >= 3) isUnlocked = true;
                break;
            case 'jack-of-all-deeds':
                const categories = new Set(approvedQuests.map(q => q.category));
                if (categories.has('environment') && categories.has('animals') && categories.has('community') && categories.has('education') && categories.has('health')) {
                    isUnlocked = true;
                }
                break;
        }

        if (isUnlocked) {
            const achievementDoc: Omit<Achievement, 'id'> = {
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon,
                unlockedAt: new Date().toISOString(),
            };
            const newAchievementRef = doc(firestore, 'users', userProfile.id, 'achievements', achievement.id);
            batch.set(newAchievementRef, achievementDoc);
            newAchievements.push({ id: achievement.id, ...achievementDoc });
        }
    });

    if (newAchievements.length > 0) {
        await batch.commit();
    }
    
    return newAchievements;
}
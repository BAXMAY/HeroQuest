'use client';
import type { AvatarConfig } from "../lib/types";

export const avatarOptions = {
    skinColors: ['#F2D0B4', '#E0A375', '#C68642', '#8D5524', '#61380B'] as const,
    hairStyles: ['short', 'long', 'bald'] as const,
    hairColors: ['#000000', '#4B3832', '#A5682A', '#D4A14E', '#FFFFFF'] as const,
    eyeStyles: ['normal', 'happy', 'wink'] as const,
    shirtStyles: ['crew', 'polo'] as const,
    shirtColors: ['#EF4444', '#3B82F6', '#22C55E', '#F97316', '#8B5CF6'] as const,
    accessories: ['none', 'glasses'] as const,
};

export const defaultAvatarConfig: AvatarConfig = {
    skinColor: avatarOptions.skinColors[0],
    hairStyle: 'short',
    hairColor: avatarOptions.hairColors[0],
    eyeStyle: 'normal',
    shirtStyle: 'crew',
    shirtColor: avatarOptions.shirtColors[1],
    accessory: 'none',
};
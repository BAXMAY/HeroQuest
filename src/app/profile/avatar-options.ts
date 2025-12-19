'use client';
import type { AvatarConfig } from "../lib/types";
import type { EarSize, EyeStyle, EyeType, HairStyle, HatType, MouthType, NoseType, ShirtType, GlassesType } from 'react-nice-avatar';

// Manually define the available options as arrays of strings
const earSizeOptions: EarSize[] = ['small', 'big'];
const eyeStyleOptions: EyeStyle[] = ['circle', 'shadow', 'round'];
const eyeTypeOptions: EyeType[] = ['circle', 'oval', 'smile', 'shadow', 'round'];
const hairStyleOptions: HairStyle[] = ['normal', 'thick', 'mohawk', 'womanLong', 'womanShort', 'womanBig', 'none'];
const hatTypeOptions: HatType[] = ['none', 'beanie', 'turban', 'party', 'hijab'];
const mouthTypeOptions: MouthType[] = ['laugh', 'smile', 'peace', 'sad', 'tongue'];
const noseTypeOptions: NoseType[] = ['short', 'long', 'round'];
const shirtTypeOptions: ShirtType[] = ['hoody', 'polo', 'shirt'];
const glassesTypeOptions: GlassesType[] = ['none', 'round', 'square'];

export const avatarOptions = {
    // Shape
    earSize: earSizeOptions,
    
    // Face
    faceColor: ['#F9C9B6', '#AC6651', '#77311D'],
    hairStyle: hairStyleOptions,
    hairColor: ['#000', '#fff', '#77311D', '#FC909F', '#D2EFF3', '#506AF4', '#F48150'],
    eyeType: eyeTypeOptions,
    eyeStyle: eyeStyleOptions,
    noseType: noseTypeOptions,
    mouthType: mouthTypeOptions,
    
    // Clothes
    shirtType: shirtTypeOptions,
    shirtColor: ['#9287FF', '#6BD9E9', '#FC909F', '#F4D150', '#77311D'],
    
    // Accessories
    glassesType: glassesTypeOptions,
    hatType: hatTypeOptions,
    hatColor: ['#000', '#fff', '#77311D', '#FC909F', '#D2EFF3', '#506AF4', '#F48150'],
    
    // Other
    bgColor: ['#9287FF', '#6BD9E9', '#FC909F', '#F4D150', '#E0DDFF', 'linear-gradient(45deg, #1A1A1A 0%, #333333 100%)'],
} as const;


export const optionLabels: { [key in keyof AvatarConfig]: string } = {
    // Shape
    earSize: 'Ear size',
    
    // Face
    faceColor: 'Face color',
    hairColor: 'Hair color',
    hairStyle: 'Hair style',
    eyeType: 'Eye type',
    eyeStyle: 'Eye style',
    noseType: 'Nose type',
    mouthType: 'Mouth type',
    
    // Clothes
    shirtType: 'Shirt',
    shirtColor: 'Shirt color',
    
    // Accessories
    glassesType: 'Glasses',
    hatType: 'Hat',
    hatColor: 'Hat color',
    
    // Other
    bgColor: 'Background',
};

export const defaultAvatarConfig: AvatarConfig = {
    faceColor: '#F9C9B6',
    hairColor: '#000',
    hatColor: '#000',
    shirtColor: '#9287FF',
    bgColor: '#E0DDFF',
    earSize: 'small',
    eyeType: 'oval',
    eyeStyle: 'circle',
    hairStyle: 'normal',
    hatType: 'none',
    mouthType: 'smile',
    noseType: 'short',
    shirtType: 'hoody',
    glassesType: 'none',
};

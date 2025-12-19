'use client';
import type { AvatarConfig } from "../lib/types";
import { earSize, eyeStyle, eyeType, hairStyle, hatType, mouthType, noseType, shirtType, glassesType } from 'react-nice-avatar';


export const avatarOptions = {
    // Shape
    earSize: Object.values(earSize),
    
    // Face
    faceColor: ['#F9C9B6', '#AC6651', '#77311D'],
    hairStyle: Object.values(hairStyle),
    hairColor: ['#000', '#fff', '#77311D', '#FC909F', '#D2EFF3', '#506AF4', '#F48150'],
    eyeType: Object.values(eyeType),
    eyeStyle: Object.values(eyeStyle),
    noseType: Object.values(noseType),
    mouthType: Object.values(mouthType),
    
    // Clothes
    shirtType: Object.values(shirtType),
    shirtColor: ['#9287FF', '#6BD9E9', '#FC909F', '#F4D150', '#77311D'],
    
    // Accessories
    glassesType: Object.values(glassesType),
    hatType: Object.values(hatType),
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
    earSize: 'small',
    faceColor: '#F9C9B6',
    hairColor: '#000',
    hairStyle: 'normal',
    hatColor: '#000',
    hatType: 'none',
    eyeType: 'normal',
    eyeStyle: 'circle',
    glassesType: 'none',
    noseType: 'short',
    mouthType: 'smile',
    shirtType: 'hoody',
    shirtColor: '#9287FF',
    bgColor: '#E0DDFF'
};

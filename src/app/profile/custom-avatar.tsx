'use client';
import type { AvatarConfig } from '../lib/types';
import { Eyes, Hair, Shirt, Accessories } from './avatar-assets';

interface CustomAvatarProps {
    config: AvatarConfig;
}

export default function CustomAvatar({ config }: CustomAvatarProps) {
    return (
        <div className="w-full h-full relative">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Skin / Head */}
                <circle cx="50" cy="50" r="40" fill={config.skinColor} />

                {/* Features */}
                <Shirt style={config.shirtStyle} color={config.shirtColor} />
                <Eyes style={config.eyeStyle} />
                <Hair style={config.hairStyle} color={config.hairColor} />
                <Accessories style={config.accessory} />
            </svg>
        </div>
    );
}

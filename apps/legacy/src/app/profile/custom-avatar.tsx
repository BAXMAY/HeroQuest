'use client';
import Avatar from 'react-nice-avatar';
import type { AvatarConfig } from '../lib/types';
import { defaultAvatarConfig } from './avatar-options';

interface CustomAvatarProps {
    config?: AvatarConfig;
    className?: string;
}

export default function CustomAvatar({ config, className }: CustomAvatarProps) {
    const avatarProps = config || defaultAvatarConfig;

    return (
        <div className={`w-full h-full relative ${className}`}>
            <Avatar
                style={{ width: '100%', height: '100%' }}
                {...avatarProps}
            />
        </div>
    );
}

'use client';
import Avatar from 'avataaars';
import type { AvatarConfig } from '../lib/types';
import { defaultAvatarConfig } from './avatar-options';

interface CustomAvatarProps {
    config?: AvatarConfig;
}

export default function CustomAvatar({ config }: CustomAvatarProps) {
    const avatarProps = config || defaultAvatarConfig;

    return (
        <div className="w-full h-full relative">
            <Avatar
                style={{ width: '100%', height: '100%' }}
                avatarStyle='Circle'
                {...avatarProps}
            />
        </div>
    );
}

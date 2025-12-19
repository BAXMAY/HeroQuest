'use client';

import { useState } from 'react';
import type { AvatarConfig } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import CustomAvatar from './custom-avatar';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { defaultAvatarConfig, avatarOptions } from './avatar-options';

interface AvatarCreatorProps {
  initialConfig?: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
}

export default function AvatarCreator({ initialConfig, onSave }: AvatarCreatorProps) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || defaultAvatarConfig);

  const handleNext = (option: keyof AvatarConfig, values: readonly string[]) => {
    const currentIndex = values.indexOf(config[option] as string);
    const nextIndex = (currentIndex + 1) % values.length;
    setConfig(prev => ({ ...prev, [option]: values[nextIndex] }));
  };

  const handlePrev = (option: keyof AvatarConfig, values: readonly string[]) => {
    const currentIndex = values.indexOf(config[option] as string);
    const prevIndex = (currentIndex - 1 + values.length) % values.length;
    setConfig(prev => ({ ...prev, [option]: values[prevIndex] }));
  };
  
  const renderSelector = (label: string, option: keyof AvatarConfig, values: readonly any[]) => (
    <div className="space-y-2">
      <Label className="font-semibold">{label}</Label>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => handlePrev(option, values)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 text-center capitalize text-sm font-medium p-2 border rounded-md bg-secondary">
          {option.includes('Color') ? (
             <div className='flex items-center justify-center gap-2'>
                <div className='w-4 h-4 rounded-full border' style={{ backgroundColor: config[option] as string }}></div>
                <span>{ (config[option] as string).replace('#', '')}</span>
            </div>
          ) : (
            config[option]
          )}
        </div>
        <Button variant="outline" size="icon" onClick={() => handleNext(option, values)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg bg-secondary/30">
        <div className="w-48 h-48 mx-auto">
          <CustomAvatar config={config} />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {renderSelector('Skin Color', 'skinColor', avatarOptions.skinColors)}
        {renderSelector('Hair Style', 'hairStyle', avatarOptions.hairStyles)}
        {renderSelector('Hair Color', 'hairColor', avatarOptions.hairColors)}
        {renderSelector('Eye Style', 'eyeStyle', avatarOptions.eyeStyles)}
        {renderSelector('Shirt Style', 'shirtStyle', avatarOptions.shirtStyles)}
        {renderSelector('Shirt Color', 'shirtColor', avatarOptions.shirtColors)}
        {renderSelector('Accessory', 'accessory', avatarOptions.accessories)}
      </div>

      <Button onClick={() => onSave(config)} className="w-full">
        <Save className="mr-2 h-4 w-4" />
        Save Avatar
      </Button>
    </div>
  );
}

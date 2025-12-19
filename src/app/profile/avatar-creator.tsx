'use client';

import { useState, useEffect } from 'react';
import type { AvatarConfig } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import CustomAvatar from './custom-avatar';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { defaultAvatarConfig, avatarOptions, optionLabels } from './avatar-options';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AvatarCreatorProps {
  initialConfig?: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
}

export default function AvatarCreator({ initialConfig, onSave }: AvatarCreatorProps) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || defaultAvatarConfig);

  useEffect(() => {
    setConfig(initialConfig || defaultAvatarConfig);
  }, [initialConfig]);


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
    <div key={option} className="space-y-2">
      <Label className="font-semibold">{label}</Label>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => handlePrev(option, values)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 text-center capitalize text-sm font-medium p-2 border rounded-md bg-secondary h-10 flex items-center justify-center">
          {option.toLowerCase().includes('color') ? (
             <div className='flex items-center justify-center gap-2'>
                <div className='w-4 h-4 rounded-full border' style={{ backgroundColor: config[option] as string }}></div>
            </div>
          ) : (
            <span className='truncate'>{String(config[option])}</span>
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
      
      <ScrollArea className="h-64">
        <div className="grid grid-cols-2 gap-4 pr-4">
          {(Object.keys(avatarOptions) as Array<keyof typeof avatarOptions>).map(key =>
            renderSelector(optionLabels[key], key, avatarOptions[key])
          )}
        </div>
      </ScrollArea>

      <Button onClick={() => onSave(config)} className="w-full">
        <Save className="mr-2 h-4 w-4" />
        Save Avatar
      </Button>
    </div>
  );
}

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

// A stable sub-component for each selector
const OptionSelector = ({
    label,
    value,
    onPrev,
    onNext,
    isColor,
  }: {
    label: string;
    value: string;
    onPrev: () => void;
    onNext: () => void;
    isColor: boolean;
  }) => {
    return (
      <div className="space-y-2">
        <Label className="font-semibold">{label}</Label>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onPrev}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 text-center capitalize text-sm font-medium p-2 border rounded-md bg-secondary h-10 flex items-center justify-center">
            {isColor ? (
              <div className="flex items-center justify-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: value }}
                ></div>
              </div>
            ) : (
              <span className="truncate">{value}</span>
            )}
          </div>
          <Button variant="outline" size="icon" onClick={onNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
};

export default function AvatarCreator({ initialConfig, onSave }: AvatarCreatorProps) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || defaultAvatarConfig);

  // This useEffect now safely initializes the state when the dialog opens
  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);


  const handleOptionChange = (option: keyof AvatarConfig, direction: 'next' | 'prev') => {
    const values = avatarOptions[option];
    const currentIndex = values.indexOf(config[option] as any);
    
    let nextIndex;
    if (direction === 'next') {
        nextIndex = (currentIndex + 1) % values.length;
    } else {
        nextIndex = (currentIndex - 1 + values.length) % values.length;
    }

    setConfig(prev => ({ ...prev, [option]: values[nextIndex] }));
  };
  
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
            <OptionSelector
                key={key}
                label={optionLabels[key]}
                value={config[key] as string}
                onPrev={() => handleOptionChange(key, 'prev')}
                onNext={() => handleOptionChange(key, 'next')}
                isColor={key.toLowerCase().includes('color')}
            />
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

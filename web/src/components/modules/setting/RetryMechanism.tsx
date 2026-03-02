'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { RotateCw, Hash, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useSettingList, useSetSetting, SettingKey } from '@/api/endpoints/setting';
import { toast } from '@/components/common/Toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/animate-ui/components/animate/tooltip';

export function SettingRetryMechanism() {
    const t = useTranslations('setting');
    const { data: settings } = useSettingList();
    const setSetting = useSetSetting();

    const [enabled, setEnabled] = useState(false);
    const [maxRetries, setMaxRetries] = useState('');

    const initialEnabled = useRef(false);
    const initialMaxRetries = useRef('');

    useEffect(() => {
        if (settings) {
            const en = settings.find(s => s.key === SettingKey.RetryOnEmptyEnabled);
            const max = settings.find(s => s.key === SettingKey.RetryOnEmptyMax);
            if (en) {
                const val = en.value === 'true';
                queueMicrotask(() => setEnabled(val));
                initialEnabled.current = val;
            }
            if (max) {
                queueMicrotask(() => setMaxRetries(max.value));
                initialMaxRetries.current = max.value;
            }
        }
    }, [settings]);

    const handleToggle = (checked: boolean) => {
        setEnabled(checked);
        setSetting.mutate({ key: SettingKey.RetryOnEmptyEnabled, value: String(checked) }, {
            onSuccess: () => {
                toast.success(t('saved'));
                initialEnabled.current = checked;
            }
        });
    };

    const handleSaveMax = () => {
        if (maxRetries === initialMaxRetries.current) return;
        setSetting.mutate({ key: SettingKey.RetryOnEmptyMax, value: maxRetries }, {
            onSuccess: () => {
                toast.success(t('saved'));
                initialMaxRetries.current = maxRetries;
            }
        });
    };

    return (
        <div className="rounded-3xl border border-border bg-card p-6 custom-shadow space-y-5">
            <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                <RotateCw className="h-5 w-5" />
                {t('retryMechanism.title')}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircle className="size-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            {t('retryMechanism.hint')}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </h2>

            {/* Enable toggle */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{t('retryMechanism.enabled.label')}</span>
                </div>
                <Switch
                    checked={enabled}
                    onCheckedChange={handleToggle}
                />
            </div>

            {/* Max retries */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{t('retryMechanism.maxRetries.label')}</span>
                </div>
                <Input
                    type="number"
                    value={maxRetries}
                    onChange={(e) => setMaxRetries(e.target.value)}
                    onBlur={handleSaveMax}
                    placeholder={t('retryMechanism.maxRetries.placeholder')}
                    className="w-48 rounded-xl"
                />
            </div>
        </div>
    );
}

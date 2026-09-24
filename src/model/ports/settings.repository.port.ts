import type { NotificationSettings } from '@/model/types/settings';

export interface ISettingsRepository {
    getSettings(): Promise<NotificationSettings>;
    saveSettings(settings: NotificationSettings): Promise<void>;
    addKnownApp(appId: string): Promise<void>;
}

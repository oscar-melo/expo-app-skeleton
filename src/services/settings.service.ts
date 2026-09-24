import type { ISettingsRepository } from '@/model/ports';
import type { NotificationSettings } from '@/model/types/settings';

export class SettingsService {
    constructor(private readonly settingsRepository: ISettingsRepository) {}

    async getSettings(): Promise<NotificationSettings> {
        return this.settingsRepository.getSettings();
    }

    async saveSettings(settings: NotificationSettings): Promise<void> {
        return this.settingsRepository.saveSettings(settings);
    }

    async addKnownApp(appId: string): Promise<void> {
        return this.settingsRepository.addKnownApp(appId);
    }
}
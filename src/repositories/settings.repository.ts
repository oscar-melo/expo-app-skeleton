import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const SETTINGS_FILE = `${FileSystem.documentDirectory}notification_settings.json`;

export interface NotificationSettings {
    notificationRegex: string;
    selectedApps: string[];
    knownApps: string[];
}

export class SettingsRepository {
    private static instance: SettingsRepository;

    private constructor() { }

    static getInstance(): SettingsRepository {
        if (!SettingsRepository.instance) {
            SettingsRepository.instance = new SettingsRepository();
        }
        return SettingsRepository.instance;
    }

    async getSettings(): Promise<NotificationSettings> {
        if (Platform.OS === 'web') {
            return this.getDefaultSettings();
        }

        try {
            const fileInfo = await FileSystem.getInfoAsync(SETTINGS_FILE);
            if (!fileInfo.exists) {
                return this.getDefaultSettings();
            }

            const content = await FileSystem.readAsStringAsync(SETTINGS_FILE);
            return JSON.parse(content) as NotificationSettings;
        } catch (error) {
            console.error('[SettingsRepo] Error reading settings:', error);
            return this.getDefaultSettings();
        }
    }

    async saveSettings(settings: NotificationSettings): Promise<void> {
        if (Platform.OS === 'web') return;

        try {
            await FileSystem.writeAsStringAsync(
                SETTINGS_FILE,
                JSON.stringify(settings, null, 2)
            );
        } catch (error) {
            console.error('[SettingsRepo] Error saving settings:', error);
        }
    }

    async addKnownApp(appId: string): Promise<void> {
        if (!appId) return;

        const settings = await this.getSettings();
        if (!settings.knownApps.includes(appId)) {
            settings.knownApps.push(appId);
            await this.saveSettings(settings);
        }
    }

    private getDefaultSettings(): NotificationSettings {
        return {
            notificationRegex: '',
            selectedApps: [],
            knownApps: [],
        };
    }
}

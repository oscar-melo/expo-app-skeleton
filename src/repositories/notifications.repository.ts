import * as FileSystem from 'expo-file-system/legacy';
import { NotificationRecord, INotificationsRepository } from '@/model/ports';
import { Platform } from 'react-native';

const NOTIFICATIONS_FILE = `${FileSystem.documentDirectory}notifications.json`;

export class NotificationsRepository implements INotificationsRepository {
    async saveNotification(notification: Omit<NotificationRecord, 'id'>): Promise<void> {
        if (Platform.OS === 'web') return;

        try {
            const records = await this.getNotifications();
            const newRecord: NotificationRecord = {
                ...notification,
                id: Date.now().toString(),
            };

            records.unshift(newRecord); // Add to the beginning

            await FileSystem.writeAsStringAsync(
                NOTIFICATIONS_FILE,
                JSON.stringify(records, null, 2)
            );
        } catch (error) {
            console.error('[NotificationsRepo] Error saving notification:', error);
        }
    }

    async getNotifications(): Promise<NotificationRecord[]> {
        if (Platform.OS === 'web') return [];

        try {
            const fileInfo = await FileSystem.getInfoAsync(NOTIFICATIONS_FILE);
            if (!fileInfo.exists) {
                return [];
            }

            const content = await FileSystem.readAsStringAsync(NOTIFICATIONS_FILE);
            return JSON.parse(content) as NotificationRecord[];
        } catch (error) {
            console.error('[NotificationsRepo] Error reading notifications:', error);
            return [];
        }
    }

    async clearNotifications(): Promise<void> {
        if (Platform.OS === 'web') return;
        try {
            await FileSystem.deleteAsync(NOTIFICATIONS_FILE, { idempotent: true });
        } catch (error) {
            console.error('[NotificationsRepo] Error clearing notifications:', error);
        }
    }
}

import * as FileSystem from 'expo-file-system/legacy';
import { NotificationRecord, INotificationsRepository } from '@/model/ports';
import { Platform } from 'react-native';

export class NotificationsRepository implements INotificationsRepository {
    private getFileName(collection: string = 'all'): string {
        return `${FileSystem.documentDirectory}notifications_${collection}.json`;
    }

    async saveNotification(notification: Omit<NotificationRecord, 'id'>, collection: string = 'all'): Promise<void> {
        if (Platform.OS === 'web') return;

        try {
            const records = await this.getNotifications(collection);
            const newRecord: NotificationRecord = {
                ...notification,
                id: Date.now().toString(),
            };

            records.unshift(newRecord); // Add to the beginning

            await FileSystem.writeAsStringAsync(
                this.getFileName(collection),
                JSON.stringify(records, null, 2)
            );
        } catch (error) {
            console.error('[NotificationsRepo] Error saving notification:', error);
        }
    }

    async getNotifications(collection: string = 'all'): Promise<NotificationRecord[]> {
        if (Platform.OS === 'web') return [];

        try {
            const fileName = this.getFileName(collection);
            const fileInfo = await FileSystem.getInfoAsync(fileName);
            if (!fileInfo.exists) {
                return [];
            }

            const content = await FileSystem.readAsStringAsync(fileName);
            return JSON.parse(content) as NotificationRecord[];
        } catch (error) {
            console.error(`[NotificationsRepo] Error reading notifications for ${collection}:`, error);
            return [];
        }
    }

    async clearNotifications(collection: string = 'all'): Promise<void> {
        if (Platform.OS === 'web') return;
        try {
            await FileSystem.deleteAsync(this.getFileName(collection), { idempotent: true });
        } catch (error) {
            console.error(`[NotificationsRepo] Error clearing notifications for ${collection}:`, error);
        }
    }

    async updateNotification(id: string, updates: Partial<NotificationRecord>, collection: string = 'filtered'): Promise<void> {
        if (Platform.OS === 'web') return;
        try {
            const records = await this.getNotifications(collection);
            const index = records.findIndex(r => r.id === id);
            if (index !== -1) {
                records[index] = { ...records[index], ...updates };
                await FileSystem.writeAsStringAsync(
                    this.getFileName(collection),
                    JSON.stringify(records, null, 2)
                );
            }
        } catch (error) {
            console.error(`[NotificationsRepo] Error updating notification ${id}:`, error);
        }
    }

    async deleteNotification(id: string, collection: string = 'filtered'): Promise<void> {
        if (Platform.OS === 'web') return;
        try {
            const records = await this.getNotifications(collection);
            const filteredRecords = records.filter(r => r.id !== id);
            await FileSystem.writeAsStringAsync(
                this.getFileName(collection),
                JSON.stringify(filteredRecords, null, 2)
            );
        } catch (error) {
            console.error(`[NotificationsRepo] Error deleting notification ${id} from ${collection}:`, error);
        }
    }

    async deleteNotifications(ids: string[], collection: string = 'filtered'): Promise<void> {
        if (Platform.OS === 'web') return;
        try {
            const idSet = new Set(ids);
            const records = await this.getNotifications(collection);
            const filteredRecords = records.filter(r => !idSet.has(r.id));
            await FileSystem.writeAsStringAsync(
                this.getFileName(collection),
                JSON.stringify(filteredRecords, null, 2)
            );
        } catch (error) {
            console.error(`[NotificationsRepo] Error deleting multiple notifications from ${collection}:`, error);
        }
    }
}

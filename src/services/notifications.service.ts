import { NOTIFICATION_COLLECTIONS, type INotificationsRepository, type NotificationCollection } from '@/model/ports';
import type { NotificationRecord } from '@/model/types/notification';

export class NotificationsService {
    constructor(private readonly notificationsRepository: INotificationsRepository) {}

    async saveNotification(notification: Omit<NotificationRecord, 'id'>, collection?: NotificationCollection): Promise<void> {
        return this.notificationsRepository.saveNotification(notification, collection);
    }

    async getNotifications(collection?: NotificationCollection): Promise<NotificationRecord[]> {
        return this.notificationsRepository.getNotifications(collection);
    }

    async updateNotification(id: string, updates: Partial<NotificationRecord>, collection?: NotificationCollection): Promise<void> {
        return this.notificationsRepository.updateNotification(id, updates, collection);
    }

    async deleteNotification(id: string, collection?: NotificationCollection): Promise<void> {
        return this.notificationsRepository.deleteNotification(id, collection);
    }

    async deleteNotifications(ids: string[], collection?: NotificationCollection): Promise<void> {
        return this.notificationsRepository.deleteNotifications(ids, collection);
    }

    async deleteFilteredNotification(id: string): Promise<void> {
        return this.notificationsRepository.deleteNotification(id, NOTIFICATION_COLLECTIONS.filtered);
    }

    async deleteFilteredNotifications(ids: string[]): Promise<void> {
        if (!ids.length) return;
        return this.notificationsRepository.deleteNotifications(ids, NOTIFICATION_COLLECTIONS.filtered);
    }

    async clearNotifications(collection?: NotificationCollection): Promise<void> {
        return this.notificationsRepository.clearNotifications(collection);
    }

    async clearFilteredNotifications(): Promise<void> {
        return this.notificationsRepository.clearNotifications(NOTIFICATION_COLLECTIONS.filtered);
    }
}
import { NotificationRecord } from '../types/notification';

export interface INotificationsRepository {
    saveNotification(notification: Omit<NotificationRecord, 'id'>, collection?: string): Promise<void>;
    getNotifications(collection?: string): Promise<NotificationRecord[]>;
    updateNotification(id: string, updates: Partial<NotificationRecord>, collection?: string): Promise<void>;
}

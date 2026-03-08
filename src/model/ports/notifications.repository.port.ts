import { NotificationRecord } from '../types/notification';

export interface INotificationsRepository {
    saveNotification(notification: Omit<NotificationRecord, 'id'>): Promise<void>;
    getNotifications(): Promise<NotificationRecord[]>;
}

import type { NotificationRecord } from '../types/notification';

export const NOTIFICATION_COLLECTIONS = {
    all: 'all',
    filtered: 'filtered',
} as const;

export type NotificationCollection = typeof NOTIFICATION_COLLECTIONS[keyof typeof NOTIFICATION_COLLECTIONS];

export interface INotificationsRepository {
    saveNotification(notification: Omit<NotificationRecord, 'id'>, collection?: NotificationCollection): Promise<void>;
    getNotifications(collection?: NotificationCollection): Promise<NotificationRecord[]>;
    updateNotification(id: string, updates: Partial<NotificationRecord>, collection?: NotificationCollection): Promise<void>;
    deleteNotification(id: string, collection?: NotificationCollection): Promise<void>;
    deleteNotifications(ids: string[], collection?: NotificationCollection): Promise<void>;
    clearNotifications(collection?: NotificationCollection): Promise<void>;
}

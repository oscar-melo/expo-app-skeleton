import { NotificationRecord } from '@/model/types/notification';

export interface INotificationsFilterHandler {
    setNext(handler: INotificationsFilterHandler): INotificationsFilterHandler;
    handle(notification: any, record?: Partial<NotificationRecord>): Promise<void>;
}

export abstract class AbstractNotificationHandler implements INotificationsFilterHandler {
    protected nextHandler: INotificationsFilterHandler | null = null;

    public setNext(handler: INotificationsFilterHandler): INotificationsFilterHandler {
        this.nextHandler = handler;
        return handler;
    }

    public async handle(notification: any, record?: Partial<NotificationRecord>): Promise<void> {
        if (this.nextHandler) {
            await this.nextHandler.handle(notification, record);
        }
    }
}

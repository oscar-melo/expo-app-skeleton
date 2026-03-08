export interface INotificationsFilterHandler {
    setNext(handler: INotificationsFilterHandler): INotificationsFilterHandler;
    handle(notification: any): Promise<void>;
}

export abstract class AbstractNotificationHandler implements INotificationsFilterHandler {
    private nextHandler: INotificationsFilterHandler | null = null;

    public setNext(handler: INotificationsFilterHandler): INotificationsFilterHandler {
        this.nextHandler = handler;
        return handler;
    }

    public async handle(notification: any): Promise<void> {
        if (this.nextHandler) {
            await this.nextHandler.handle(notification);
        }
    }
}

import { AbstractNotificationHandler } from './notification-filter';
import type { INotificationsRepository, ISettingsRepository } from '@/model/ports';

export class SaveAllHandler extends AbstractNotificationHandler {
    constructor(
        private readonly notificationsRepository: INotificationsRepository,
        private readonly settingsRepository: ISettingsRepository,
    ) {
        super();
    }

    public async handle(notification: any): Promise<void> {
        if (!notification || (!notification.text && !notification.title)) {
            return super.handle(notification);
        }

        const now = new Date();
        const fecha = now.toLocaleDateString();
        const hora = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let fuente = 'App';
        if (notification.app === 'com.google.android.apps.messaging' || notification.app === 'com.android.mms') {
            fuente = 'SMS';
        }

        const origen = notification.title || notification.app;
        const contenido = notification.text || notification.titleBig || 'Notificación sin texto';

        const record = {
            fuente,
            origen,
            contenido,
            fecha,
            hora,
        };

        // Save to 'all' collection
        await this.notificationsRepository.saveNotification(record, 'all');

        // Add app to known apps
        if (notification.app) {
            await this.settingsRepository.addKnownApp(notification.app);
        }

        return super.handle(notification, record);
    }
}

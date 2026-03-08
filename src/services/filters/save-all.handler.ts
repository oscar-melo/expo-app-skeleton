import { AbstractNotificationHandler } from './notification-filter';
import { NotificationsRepository } from '@/repositories/notifications.repository';
import { SettingsRepository } from '@/repositories/settings.repository';

export class SaveAllHandler extends AbstractNotificationHandler {
    private repo: NotificationsRepository;
    private settingsRepo: SettingsRepository;

    constructor() {
        super();
        this.repo = new NotificationsRepository();
        this.settingsRepo = SettingsRepository.getInstance();
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

        // Save to 'all' collection
        await this.repo.saveNotification({
            fuente,
            origen,
            contenido,
            fecha,
            hora,
        }, 'all');

        // Add app to known apps
        if (notification.app) {
            await this.settingsRepo.addKnownApp(notification.app);
        }

        return super.handle(notification);
    }
}

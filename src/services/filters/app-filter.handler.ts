import { AbstractNotificationHandler } from './notification-filter';
import { SettingsRepository } from '@/repositories/settings.repository';

import { NotificationRecord } from '@/model/types/notification';

export class AppFilterHandler extends AbstractNotificationHandler {
    private settingsRepo: SettingsRepository;

    constructor() {
        super();
        this.settingsRepo = SettingsRepository.getInstance();
    }

    public async handle(notification: any, record?: Partial<NotificationRecord>): Promise<void> {
        if (!notification || !notification.app) {
            return super.handle(notification, record);
        }

        const settings = await this.settingsRepo.getSettings();
        const selectedApps = settings.selectedApps;

        // Si no hay apps seleccionadas, se escucha todo
        if (!selectedApps || selectedApps.length === 0) {
            return super.handle(notification, record);
        }

        // Si hay apps seleccionadas y esta app está en la lista, pasa
        if (selectedApps.includes(notification.app)) {
            return super.handle(notification, record);
        }

        // Si la app no está seleccionada, se detiene la cadena aquí
        console.log(`[AppFilterHandler] Dropping notification from unselected app: ${notification.app}`);
    }
}

import { AbstractNotificationHandler } from './notification-filter';
import { SettingsRepository } from '@/repositories/settings.repository';
import { NotificationRecord } from '@/model/types/notification';

export class RegexFilterHandler extends AbstractNotificationHandler {
    private settingsRepo: SettingsRepository;

    constructor() {
        super();
        this.settingsRepo = SettingsRepository.getInstance();
    }

    public async handle(notification: any, record?: Partial<NotificationRecord>): Promise<void> {
        if (!notification) {
            return super.handle(notification, record);
        }

        const settings = await this.settingsRepo.getSettings();
        const regexStr = settings.notificationRegex;

        // Si no hay regex configurado, el usuario quiere filtrar pero no ha definido cómo.
        // Asumimos que si no hay regex, no pasa el filtro de usuario (o podrías cambiar esto a que pase todo).
        if (!regexStr) {
            console.log(`[RegexFilterHandler] No regex configured. Stopping chain.`);
            return;
        }

        const contenido = notification.text || notification.titleBig || '';
        const title = notification.title || '';
        const fullText = `${title} ${contenido}`;

        try {
            const regex = new RegExp(regexStr, 'i');
            if (regex.test(fullText)) {
                // Match found, pass to the next handler (e.g., CurrencyFilter)
                return super.handle(notification, record);
            } else {
                console.log(`[RegexFilterHandler] Notification text did not match user regex.`);
            }
        } catch (error) {
            console.error(`[RegexFilterHandler] Invalid regex expression: ${regexStr}`, error);
        }
    }
}

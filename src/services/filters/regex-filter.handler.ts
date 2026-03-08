import { AbstractNotificationHandler } from './notification-filter';
import { NotificationsRepository } from '@/repositories/notifications.repository';
import { SettingsRepository } from '@/repositories/settings.repository';

export class RegexFilterHandler extends AbstractNotificationHandler {
    private repo: NotificationsRepository;
    private settingsRepo: SettingsRepository;

    constructor() {
        super();
        this.repo = new NotificationsRepository();
        this.settingsRepo = SettingsRepository.getInstance();
    }

    public async handle(notification: any): Promise<void> {
        if (!notification) {
            return super.handle(notification);
        }

        const settings = await this.settingsRepo.getSettings();
        const regexStr = settings.notificationRegex;

        if (!regexStr) {
            // Si no hay regex configurado, no pasa a 'filtered' o depende de la lógica deseada.
            // Según los requerimientos: "Filtro Expresion Regular (filtra los mensajes usando expresion regular)".
            // Si no hay regex, consideramos que no hace match con nada (o podríamos guardarlo todo, asumimos no guardar).
            console.log(`[RegexFilterHandler] No regex configured. Skipping save to 'filtered'.`);
            return super.handle(notification);
        }

        const contenido = notification.text || notification.titleBig || '';
        const title = notification.title || '';
        const fullText = `${title} ${contenido}`;

        try {
            const regex = new RegExp(regexStr, 'i'); // case insensitive
            if (regex.test(fullText)) {
                // Generar los metadatos para guardar
                const now = new Date();
                const fecha = now.toLocaleDateString();
                const hora = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                let fuente = 'App';
                if (notification.app === 'com.google.android.apps.messaging' || notification.app === 'com.android.mms') {
                    fuente = 'SMS';
                }
                const origen = title || notification.app;

                // Match found, save to filtered collection
                await this.repo.saveNotification({
                    fuente,
                    origen,
                    contenido: contenido || 'Notificación sin texto',
                    fecha,
                    hora,
                }, 'filtered');
            } else {
                console.log(`[RegexFilterHandler] Notification text did not match regex ${regexStr}.`);
            }
        } catch (error) {
            console.error(`[RegexFilterHandler] Invalid regex expression: ${regexStr}`, error);
        }

        return super.handle(notification);
    }
}

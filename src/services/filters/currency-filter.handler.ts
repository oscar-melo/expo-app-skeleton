import { AbstractNotificationHandler } from './notification-filter';
import { NotificationsRepository } from '@/repositories/notifications.repository';
import { NotificationRecord } from '@/model/types/notification';

export class CurrencyFilterHandler extends AbstractNotificationHandler {
    private repo: NotificationsRepository;

    // Regex para detectar valores monetarios como $500.000, $ 31,921, $6,950.00, $9,000.00, $1,000.00
    // Captura el símbolo/texto de moneda opcional y el valor numérico de forma flexible
    public static readonly CURRENCY_REGEX = /(?:\$|COP|USD)\s?(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/i;

    constructor() {
        super();
        this.repo = new NotificationsRepository();
    }

    public async handle(notification: any, record?: Partial<NotificationRecord>): Promise<void> {
        if (!notification || !record) {
            return;
        }

        const contenido = notification.text || notification.titleBig || '';
        const title = notification.title || '';
        const fullText = `${title} ${contenido}`;

        const match = fullText.match(CurrencyFilterHandler.CURRENCY_REGEX);

        if (match) {
            const montoDetectado = match[1]; // El primer grupo de captura es el número

            // Actualizamos el record con el monto encontrado
            const finalRecord: NotificationRecord = {
                ...record as NotificationRecord,
                id: record.id || Math.random().toString(36).substring(2, 9),
                monto: montoDetectado,
                tipoTransaccion: undefined, // Se llenará por el usuario
                categoria: undefined,      // Se llenará por el usuario
            };

            console.log(`[CurrencyFilterHandler] Saving record to 'filtered':`, JSON.stringify(finalRecord));
            // Este es el último filtro mandatorio para la lista filtrada, así que guardamos aquí.
            await this.repo.saveNotification(finalRecord, 'filtered');

            // Continuamos la cadena por si hay más procesadores futuros
            return super.handle(notification, finalRecord);
        } else {
            console.log(`[CurrencyFilterHandler] No currency pattern found in notification. Skipping 'filtered' save.`);
        }
    }
}

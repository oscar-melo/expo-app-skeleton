import type { INotificationsRepository, NotificationRecord } from '@/model/ports';

const DEMO_RECORDS: NotificationRecord[] = [
    {
        id: 'demo-income',
        fuente: 'App',
        origen: 'Bancolombia',
        contenido: 'Recibiste una transferencia por $2,500,000',
        fecha: '20/09/2026',
        hora: '10:15 a. m.',
        monto: '2,500,000',
        tipoTransaccion: 'ingreso',
    },
    {
        id: 'demo-expense',
        fuente: 'App',
        origen: 'Bancolombia',
        contenido: 'Compra aprobada por $85,000 en Tienda X',
        fecha: '20/09/2026',
        hora: '11:40 a. m.',
        monto: '85,000',
        tipoTransaccion: 'egreso',
    },
];

export class MockNotificationsRepository implements INotificationsRepository {
    private records = DEMO_RECORDS.map(record => ({ ...record }));

    async saveNotification(notification: Omit<NotificationRecord, 'id'>, collection = 'all'): Promise<void> {
        if (collection === 'filtered') {
            this.records.unshift({ ...notification, id: `demo-${Date.now()}` });
        }
    }

    async getNotifications(collection = 'all'): Promise<NotificationRecord[]> {
        return collection === 'filtered' ? this.records.map(record => ({ ...record })) : [];
    }

    async updateNotification(id: string, updates: Partial<NotificationRecord>, collection = 'filtered'): Promise<void> {
        if (collection !== 'filtered') return;
        const index = this.records.findIndex(record => record.id === id);
        if (index >= 0) this.records[index] = { ...this.records[index], ...updates };
    }

    async deleteNotification(id: string, collection = 'filtered'): Promise<void> {
        await this.deleteNotifications([id], collection);
    }

    async deleteNotifications(ids: string[], collection = 'filtered'): Promise<void> {
        if (collection !== 'filtered') return;
        const idsToDelete = new Set(ids);
        this.records = this.records.filter(record => !idsToDelete.has(record.id));
    }

    async clearNotifications(collection = 'all'): Promise<void> {
        if (collection === 'filtered') this.records = [];
    }
}

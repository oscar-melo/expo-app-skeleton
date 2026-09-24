import { NotificationsService } from '../notifications.service';
import { NOTIFICATION_COLLECTIONS } from '@/model/ports';

describe('NotificationsService', () => {
    it('delegates the deletion of one filtered notification to the repository', async () => {
        const repository = {
            saveNotification: jest.fn(),
            getNotifications: jest.fn(),
            updateNotification: jest.fn(),
            deleteNotification: jest.fn(),
            deleteNotifications: jest.fn(),
            clearNotifications: jest.fn(),
        };
        const service = new NotificationsService(repository as any);

        await service.deleteFilteredNotification('n1');

        expect(repository.deleteNotification).toHaveBeenCalledWith('n1', NOTIFICATION_COLLECTIONS.filtered);
    });

    it('delegates the deletion of several filtered notifications to the repository', async () => {
        const repository = {
            saveNotification: jest.fn(),
            getNotifications: jest.fn(),
            updateNotification: jest.fn(),
            deleteNotification: jest.fn(),
            deleteNotifications: jest.fn(),
            clearNotifications: jest.fn(),
        };
        const service = new NotificationsService(repository as any);

        await service.deleteFilteredNotifications(['n1', 'n2']);

        expect(repository.deleteNotifications).toHaveBeenCalledWith(['n1', 'n2'], NOTIFICATION_COLLECTIONS.filtered);
    });

    it('clears the filtered collection through the repository', async () => {
        const repository = {
            saveNotification: jest.fn(),
            getNotifications: jest.fn(),
            updateNotification: jest.fn(),
            deleteNotification: jest.fn(),
            deleteNotifications: jest.fn(),
            clearNotifications: jest.fn(),
        };
        const service = new NotificationsService(repository as any);

        await service.clearFilteredNotifications();

        expect(repository.clearNotifications).toHaveBeenCalledWith(NOTIFICATION_COLLECTIONS.filtered);
    });
});

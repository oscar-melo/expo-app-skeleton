import { NotificationsRepository } from '../notifications.repository';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

jest.mock('expo-file-system/legacy', () => ({
    documentDirectory: 'file:///test-dir/',
    writeAsStringAsync: jest.fn(),
    readAsStringAsync: jest.fn(),
    getInfoAsync: jest.fn(),
    deleteAsync: jest.fn(),
}));

describe('NotificationsRepository', () => {
    let repository: NotificationsRepository;

    beforeEach(() => {
        repository = new NotificationsRepository();
        jest.clearAllMocks();
    });

    describe('getNotifications', () => {
        it('returns empty array on web', async () => {
            Platform.OS = 'web';
            const result = await repository.getNotifications();
            expect(result).toEqual([]);
            expect(FileSystem.getInfoAsync).not.toHaveBeenCalled();
        });

        it('returns empty array if file does not exist (Android/iOS)', async () => {
            Platform.OS = 'android';
            (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

            const result = await repository.getNotifications();
            expect(result).toEqual([]);
        });

        it('returns parsed records if file exists', async () => {
            Platform.OS = 'android';
            const mockRecords = [{ id: '1', fuente: 'SMS', origen: '123', contenido: 'Hi', fecha: '1/1/2026', hora: '10:00 AM' }];
            (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
            (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(JSON.stringify(mockRecords));

            const result = await repository.getNotifications();
            expect(result).toEqual(mockRecords);
        });
    });

    describe('saveNotification', () => {
        it('does nothing on web', async () => {
            Platform.OS = 'web';
            await repository.saveNotification({ fuente: 'SMS', origen: '1', contenido: 'X', fecha: 'D', hora: 'H' });
            expect(FileSystem.writeAsStringAsync).not.toHaveBeenCalled();
        });

        it('saves a new notification to the file', async () => {
            Platform.OS = 'android';
            (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

            const notification = { fuente: 'App', origen: 'Test', contenido: 'Hello', fecha: '2026-03-08', hora: '08:55 AM' };
            await repository.saveNotification(notification);

            expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
                expect.stringContaining('notifications.json'),
                expect.stringContaining('Hello')
            );
        });

        it('prepends new notification to existing ones', async () => {
            Platform.OS = 'android';
            const existing = [{ id: 'old', fuente: 'SMS', origen: '888', contenido: 'Old', fecha: 'X', hora: 'Y' }];
            (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
            (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(JSON.stringify(existing));

            const notification = { fuente: 'App', origen: 'New', contenido: 'NewMsg', fecha: 'D', hora: 'T' };
            await repository.saveNotification(notification);

            const writeCall = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0];
            const savedData = JSON.parse(writeCall[1]);

            expect(savedData.length).toBe(2);
            expect(savedData[0].contenido).toBe('NewMsg');
            expect(savedData[1].id).toBe('old');
        });
    });

    describe('clearNotifications', () => {
        it('deletes the file on mobile', async () => {
            Platform.OS = 'android';
            (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

            await repository.clearNotifications();
            expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
                expect.stringContaining('notifications.json'),
                { idempotent: true }
            );
        });
    });
});

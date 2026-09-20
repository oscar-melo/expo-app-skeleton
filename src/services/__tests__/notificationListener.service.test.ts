import { NotificationListenerService, headlessNotificationListener } from '../notificationListener.service';
import RNNotificationListener from 'react-native-notification-listener';
import { NotificationsRepository } from '@/repositories/notifications.repository';
import { AppRegistry, Platform } from 'react-native';

// Mock del repositorio de notificaciones
jest.mock('@/repositories/notifications.repository');

// Mock del repositorio de configuraciones
jest.mock('@/repositories/settings.repository', () => {
    return {
        SettingsRepository: {
            getInstance: jest.fn().mockReturnValue({
                getSettings: jest.fn().mockResolvedValue({
                    notificationRegex: '',
                    selectedApps: [],
                    knownApps: [],
                }),
                saveSettings: jest.fn(),
                addKnownApp: jest.fn(),
            }),
        },
    };
});

// Mock del listener
jest.mock('react-native-notification-listener', () => {
    return {
        __esModule: true,
        default: {
            getPermissionStatus: jest.fn(),
            requestPermission: jest.fn(),
            RNAndroidNotificationListenerHeadlessJsName: 'RNAndroidNotificationListenerHeadlessJs',
        },
        getPermissionStatus: jest.fn(),
        requestPermission: jest.fn(),
        RNAndroidNotificationListenerHeadlessJsName: 'RNAndroidNotificationListenerHeadlessJs',
    };
});

describe('NotificationListenerService', () => {
    let service: NotificationListenerService;
    let mockRepo: jest.Mocked<NotificationsRepository>;
    let mockRN: any;

    beforeEach(() => {
        jest.clearAllMocks();
        service = NotificationListenerService.getInstance();
        mockRepo = (NotificationsRepository as jest.Mock).prototype;
        mockRN = require('react-native-notification-listener');
    });

    describe('startListening', () => {
        it('does nothing on web', async () => {
            Platform.OS = 'web';
            await service.startListening();
            expect(mockRN.default.getPermissionStatus).not.toHaveBeenCalled();
        });

        it('checks permissions and requests if not authorized on Android', async () => {
            Platform.OS = 'android';
            mockRN.default.getPermissionStatus.mockResolvedValue('denied');

            await service.startListening();

            expect(mockRN.default.getPermissionStatus).toHaveBeenCalled();
            expect(mockRN.default.requestPermission).toHaveBeenCalled();
        });

        it('does not request permission if already authorized', async () => {
            Platform.OS = 'android';
            mockRN.default.getPermissionStatus.mockResolvedValue('authorized');

            await service.startListening();

            expect(mockRN.default.getPermissionStatus).toHaveBeenCalled();
            expect(mockRN.default.requestPermission).not.toHaveBeenCalled();
        });
    });

    describe('headlessNotificationListener', () => {
        it('formats and saves valid SMS notifications', async () => {
            const mockEvent = {
                title: '123456',
                text: 'Hello SMS',
                app: 'com.google.android.apps.messaging',
            };

            await headlessNotificationListener({ notification: JSON.stringify(mockEvent) });

            expect(mockRepo.saveNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    fuente: 'SMS',
                    origen: '123456',
                    contenido: 'Hello SMS',
                }),
                'all'
            );
        });

        it('formats and saves valid App notifications', async () => {
            const mockEvent = {
                title: 'WhatsApp',
                text: 'New message',
                app: 'com.whatsapp',
            };

            await headlessNotificationListener({ notification: mockEvent });

            expect(mockRepo.saveNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    fuente: 'App',
                    origen: 'WhatsApp',
                    contenido: 'New message',
                }),
                'all'
            );
        });

        it('ignores notifications without text and title', async () => {
            const mockEvent = {
                app: 'com.whatsapp',
            };

            await headlessNotificationListener({ notification: mockEvent });

            expect(mockRepo.saveNotification).not.toHaveBeenCalled();
        });

        it('handles parsing errors gracefully', async () => {
            await headlessNotificationListener({ notification: 'invalid-json' });

            expect(mockRepo.saveNotification).not.toHaveBeenCalled();
        });
    });
});

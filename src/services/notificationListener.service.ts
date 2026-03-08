import * as RNNotificationListenerModule from 'react-native-notification-listener';
import { AppRegistry, Platform } from 'react-native';
import { NotificationsRepository } from '@/repositories/notifications.repository';

// Manejo de importación segura
const RNNotificationListener = (RNNotificationListenerModule as any).default || RNNotificationListenerModule;
const HeadlessJsName = RNNotificationListenerModule.RNAndroidNotificationListenerHeadlessJsName || 'RNAndroidNotificationListenerHeadlessJs';

// Tarea principal (Headless Task)
export const headlessNotificationListener = async ({ notification }: any) => {
    let event: any = notification;
    if (typeof notification === 'string') {
        try {
            event = JSON.parse(notification);
        } catch (error) {
            console.error('Error parsing notification:', error);
            return;
        }
    }

    if (!event || (!event.text && !event.title)) return;

    const now = new Date();
    const fecha = now.toLocaleDateString();
    const hora = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let fuente = 'App';
    if (event.app === 'com.google.android.apps.messaging' || event.app === 'com.android.mms') {
        fuente = 'SMS';
    }

    const repo = new NotificationsRepository();
    await repo.saveNotification({
        fuente,
        origen: event.title || event.app,
        contenido: event.text || event.titleBig || 'Notificación sin texto',
        fecha,
        hora,
    });
};

// Registrar la tarea Headless tan pronto como se cargue el archivo
if (Platform.OS === 'android') {
    AppRegistry.registerHeadlessTask(HeadlessJsName, () => headlessNotificationListener);
}

// Servicio para permisos
export class NotificationListenerService {
    private static instance: NotificationListenerService;

    private constructor() { }

    static getInstance(): NotificationListenerService {
        if (!NotificationListenerService.instance) {
            NotificationListenerService.instance = new NotificationListenerService();
        }
        return NotificationListenerService.instance;
    }

    async startListening() {
        if (Platform.OS === 'web') return;

        try {
            const status = await RNNotificationListener.getPermissionStatus();
            if (status !== 'authorized') {
                console.warn('[NotificationListener] Soliciting permissions...');
                if (RNNotificationListener.requestPermission) {
                    RNNotificationListener.requestPermission();
                }
            } else {
                console.log('[NotificationListener] Permissions granted. Headless task registered.');
            }
        } catch (error) {
            console.error('[NotificationListener] Error checking permissions:', error);
        }
    }
}

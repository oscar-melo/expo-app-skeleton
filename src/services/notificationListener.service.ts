import * as RNNotificationListenerModule from 'react-native-notification-listener';
import { AppRegistry, Platform } from 'react-native';
import { SaveAllHandler } from './filters/save-all.handler';
import { AppFilterHandler } from './filters/app-filter.handler';
import { RegexFilterHandler } from './filters/regex-filter.handler';
import { CurrencyFilterHandler } from './filters/currency-filter.handler';

// Manejo de importación segura
const RNNotificationListener = (RNNotificationListenerModule as any).default || RNNotificationListenerModule;
const HeadlessJsName = RNNotificationListenerModule.RNAndroidNotificationListenerHeadlessJsName || 'RNAndroidNotificationListenerHeadlessJs';

// Setup the filter chain
const saveAllHandler = new SaveAllHandler();
const appFilterHandler = new AppFilterHandler();
const regexFilterHandler = new RegexFilterHandler();
const currencyFilterHandler = new CurrencyFilterHandler();

saveAllHandler
    .setNext(appFilterHandler)
    .setNext(regexFilterHandler)
    .setNext(currencyFilterHandler);

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

    if (!event) return;

    try {
        await saveAllHandler.handle(event);
    } catch (error) {
        console.error('[NotificationListener] Error processing notification chain:', error);
    }
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

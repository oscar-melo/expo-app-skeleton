import React, { createContext, useContext, useMemo } from 'react';
import { Platform } from 'react-native';
import { AuthRepository } from '@/repositories/auth.repository';
import { MockNotificationsRepository } from '@/repositories/mock-notifications.repository';
import { NotificationsRepository } from '@/repositories/notifications.repository';
import { SettingsRepository } from '@/repositories/settings.repository';
import { AuthService } from '@/services/auth.service';
import { NotificationsService } from '@/services/notifications.service';
import { SettingsService } from '@/services/settings.service';
import type { AuthService as IAuthService } from '@/services/auth.service';
import type { NotificationsService as INotificationsService } from '@/services/notifications.service';
import type { SettingsService as ISettingsService } from '@/services/settings.service';

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const notificationsRepository = Platform.OS === 'web'
  ? new MockNotificationsRepository()
  : new NotificationsRepository();
const notificationsService = new NotificationsService(notificationsRepository);
const settingsService = new SettingsService(SettingsRepository.getInstance());

// Pre-carga asíncrona (no bloquea el render)
authRepository.prefetchDiscovery();

interface Services {
  authService: IAuthService;
  notificationsService: INotificationsService;
  settingsService: ISettingsService;
}

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<Services>(
    () => ({
      authService,
      notificationsService,
      settingsService,
    }),
    []
  );
  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error('useServices must be used within ServicesProvider');
  return ctx;
}

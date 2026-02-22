import React, { createContext, useContext, useMemo } from 'react';
import { AuthRepository } from '@/repositories/auth.repository';
import { AuthService } from '@/services/auth.service';
import type { AuthService as IAuthService } from '@/services/auth.service';

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

// Pre-carga asíncrona (no bloquea el render)
authRepository.prefetchDiscovery();

interface Services {
  authService: IAuthService;
}

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<Services>(
    () => ({
      authService,
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

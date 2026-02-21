import type { IAuthRepository } from '@/model/ports';
import type { AuthResult } from '@/model/types';

/**
 * Servicio de autenticación. Depende del puerto IAuthRepository (inyectado).
 * La UI solo conoce esta API.
 */
export class AuthService {
  constructor(private readonly authRepository: IAuthRepository) {}

  async loginWithGoogle(): Promise<AuthResult | null> {
    return this.authRepository.loginWithGoogle();
  }

  async logout(): Promise<void> {
    if (this.authRepository.logout) {
      await this.authRepository.logout();
    }
  }
}

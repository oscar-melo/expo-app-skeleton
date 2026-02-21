import type { User } from './user';

/**
 * Resultado de un intento de login con proveedor externo (ej. Google).
 */
export interface AuthResult {
  user: User;
  accessToken: string;
  idToken?: string;
}

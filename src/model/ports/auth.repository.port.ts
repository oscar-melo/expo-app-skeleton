import type { AuthResult } from '../types/auth';

/**
 * Puerto (interface) para obtención de credenciales y datos de usuario
 * desde un proveedor externo (ej. Google). Las implementaciones concretas
 * viven en la capa de repositorios.
 */
export interface IAuthRepository {
  /**
   * Inicia el flujo de login con el proveedor (redirect, etc.) y devuelve
   * el usuario y tokens, o null si el usuario cancela o falla.
   */
  loginWithGoogle(): Promise<AuthResult | null>;

  /**
   * Cierra la sesión en el proveedor (revocar token, etc.) si aplica.
   */
  logout?(): Promise<void>;
}

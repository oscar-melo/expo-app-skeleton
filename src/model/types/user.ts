/**
 * Usuario autenticado (datos mínimos devueltos por el proveedor de auth).
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  picture?: string | null;
}

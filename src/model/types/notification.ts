export interface NotificationRecord {
  id: string;
  fuente: string;
  origen: string;
  contenido: string;
  fecha: string;
  hora: string;
  monto?: string;
  tipoTransaccion?: 'ingreso' | 'egreso';
  categoria?: string;
}

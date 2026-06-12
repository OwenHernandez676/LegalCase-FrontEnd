import { NotificationType } from './enums';
export interface AppNotification {
  id: string;
  tipo: NotificationType;
  mensaje: string;
  time: string;
  leida: boolean;
  icon: string;
  /** Ruta a la que navega la campana al hacer clic en la notificación. */
  route?: string;
}

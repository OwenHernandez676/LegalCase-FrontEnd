import { NotificationType } from './enums';
export interface AppNotification {
  id: string;
  tipo: NotificationType;
  mensaje: string;
  time: string;
  leida: boolean;
  icon: string;
}

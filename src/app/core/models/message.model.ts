import { Role } from './enums';

export interface ChatMessage {
  id: string;
  me: boolean;
  text: string;
  time: string;
}

/** Conversación Cliente ↔ Abogado con su historial y contador de no leídos. */
export interface Conversation {
  id: string;
  nombre: string;
  detalle: string;
  /** Rol que ve esta conversación en su bandeja. */
  visiblePara: Role;
  noLeidos: number;
  mensajes: ChatMessage[];
}

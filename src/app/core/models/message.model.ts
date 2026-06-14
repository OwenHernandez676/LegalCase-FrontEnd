import { FileType, Role } from './enums';

/** Archivo adjunto a un mensaje (documento o imagen). */
export interface ChatAttachment {
  name: string;
  size: string;
  ext: FileType;
  /** URL temporal (object URL) para descargar lo subido en esta sesión. */
  url?: string;
  /** Id del mensaje en el backend, para descargar el adjunto persistido (GET /messages/:id/attachment). */
  msgId?: string;
}

export interface ChatMessage {
  id: string;
  me: boolean;
  text: string;
  time: string;
  attachment?: ChatAttachment;
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

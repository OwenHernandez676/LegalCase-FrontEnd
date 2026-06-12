import { Injectable, computed, inject, signal } from '@angular/core';
import { ChatMessage, Conversation, Role } from '../models';
import { MOCK_CONVERSATIONS } from './mock-data';
import { NotificationService } from './notification.service';

/**
 * Mensajería Cliente ↔ Abogado. Mantiene las conversaciones, el historial,
 * los contadores de no leídos y publica notificaciones al recibir mensajes.
 */
@Injectable({ providedIn: 'root' })
export class MessagesService {
  private seq = 0;
  private readonly notifs = inject(NotificationService);

  private readonly _conversations = signal<Conversation[]>(MOCK_CONVERSATIONS);
  readonly conversations = this._conversations.asReadonly();

  /** Conversación abierta actualmente en la pantalla de mensajes. */
  readonly activeId = signal<string | null>(null);

  /** Total de mensajes sin leer (para badges de la bandeja). */
  readonly totalUnread = computed(() =>
    this._conversations().reduce((acc, c) => acc + c.noLeidos, 0));

  /** Bandeja visible según el rol: el abogado ve clientes, el cliente a su abogado. */
  forRole(role: Role): Conversation[] {
    const target: Role = role === 'cliente' ? 'cliente' : 'abogado';
    return this._conversations().filter((c) => c.visiblePara === target);
  }

  open(id: string): void {
    this.activeId.set(id);
    this._conversations.update((list) =>
      list.map((c) => (c.id === id ? { ...c, noLeidos: 0 } : c)));
  }

  send(convId: string, text: string): void {
    const msg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + ++this.seq,
      me: true,
      text,
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    };
    this.appendMessage(convId, msg);

    // Demo sin backend: la contraparte responde y genera la notificación
    // que en producción produciría el mensaje entrante real.
    setTimeout(() => this.receiveReply(convId), 1400);
  }

  private receiveReply(convId: string): void {
    const conv = this._conversations().find((c) => c.id === convId);
    if (!conv) return;
    const reply: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + ++this.seq,
      me: false,
      text: 'Recibido, gracias. Le doy seguimiento y le confirmo a la brevedad.',
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    };
    this.appendMessage(convId, reply, this.activeId() !== convId);
    this.notifs.push({
      tipo: 'mensaje',
      mensaje: `${conv.nombre} envió un mensaje`,
      icon: 'msg',
      route: '/app/messages',
    });
  }

  private appendMessage(convId: string, msg: ChatMessage, countUnread = false): void {
    this._conversations.update((list) =>
      list.map((c) => (c.id === convId
        ? { ...c, mensajes: [...c.mensajes, msg], noLeidos: c.noLeidos + (countUnread ? 1 : 0) }
        : c)));
  }
}

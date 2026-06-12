import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { ChatMessage, Conversation, LegalCase, Role } from '../models';
import { ApiService } from './api.service';
import { AuthStore } from '../store/auth.store';
import { CasesService } from './cases.service';
import { NotificationService } from './notification.service';
import { fileExt, fileSize } from '../utils/file.util';
import { ApiMessage, isObjectId, mapMessage } from './api.mappers';

/**
 * Mensajería Cliente ↔ Abogado sobre la API real: cada expediente es una
 * conversación (GET /api/messages/:expedienteId, POST /api/messages).
 * La bandeja se deriva de los expedientes del usuario autenticado.
 */
@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthStore);
  private readonly casesSvc = inject(CasesService);
  private readonly notifs = inject(NotificationService);

  /** Historial por expediente y contadores de no leídos. */
  private readonly _messages = signal<Record<string, ChatMessage[]>>({});
  private readonly _unread = signal<Record<string, number>>({});
  private readonly fetched = new Set<string>();

  /** Conversación abierta actualmente en la pantalla de mensajes. */
  readonly activeId = signal<string | null>(null);

  readonly conversations = computed(() => this.forRole(this.auth.role() ?? 'cliente'));

  /** Total de mensajes sin leer (para badges de la bandeja). */
  readonly totalUnread = computed(() =>
    Object.values(this._unread()).reduce((acc, n) => acc + n, 0));

  constructor() {
    // Al iniciar sesión (o llegar los expedientes) carga el historial de la
    // conversación activa o de la primera de la bandeja.
    effect(() => {
      if (!this.auth.isAuthenticated()) {
        this._messages.set({});
        this._unread.set({});
        this.fetched.clear();
        this.activeId.set(null);
        return;
      }
      const id = this.activeId() ?? this.conversations()[0]?.id;
      if (id) untracked(() => this.ensureLoaded(id));
    });
  }

  /** Bandeja visible según el rol: el abogado ve clientes, el cliente a su abogado. */
  forRole(role: Role): Conversation[] {
    const me = this.auth.user()?.nombre ?? '';
    const cases = this.casesSvc.cases();
    const visibles = role === 'cliente'
      ? cases.filter((c) => c.cliente === me)
      : role === 'abogado'
        ? cases.filter((c) => c.abogado === me)
        : cases;
    return visibles.map((c) => this.toConversation(c, role));
  }

  open(id: string): void {
    this.activeId.set(id);
    this.ensureLoaded(id);
    // Sin endpoint de lectura por mensaje: el contador se limpia localmente.
    this._unread.update((u) => ({ ...u, [id]: 0 }));
  }

  send(convId: string, text: string): void {
    const me = this.auth.user()?.nombre ?? '';
    const conv = this.conversations().find((c) => c.id === convId);
    this.api.post<ApiMessage>('messages', {
      expedienteId: convId,
      emisor: me,
      receptor: conv?.nombre ?? '',
      texto: text,
    }).subscribe({
      next: (dto) => this.append(convId, mapMessage(dto, me)),
    });
  }

  /**
   * Envía un archivo adjunto. El backend solo persiste texto, así que se
   * registra el mensaje con la referencia del archivo y el adjunto queda
   * disponible localmente (object URL) durante la sesión.
   */
  sendFile(convId: string, file: File): void {
    const me = this.auth.user()?.nombre ?? '';
    const conv = this.conversations().find((c) => c.id === convId);
    const size = fileSize(file.size);
    this.api.post<ApiMessage>('messages', {
      expedienteId: convId,
      emisor: me,
      receptor: conv?.nombre ?? '',
      texto: `📎 ${file.name} (${size})`,
    }).subscribe({
      next: (dto) => {
        const msg = mapMessage(dto, me);
        this.append(convId, {
          ...msg,
          text: '',
          attachment: {
            name: file.name,
            size,
            ext: fileExt(file.name),
            url: URL.createObjectURL(file),
          },
        });
        this.notifs.push({
          tipo: 'documento',
          mensaje: `Archivo enviado a ${conv?.nombre ?? 'la conversación'}: ${file.name}`,
          icon: 'doc',
          route: '/app/messages',
        });
      },
    });
  }

  private toConversation(c: LegalCase, role: Role): Conversation {
    return {
      id: c.id,
      nombre: role === 'cliente' ? c.abogado : c.cliente,
      detalle: `${c.codigo ?? c.id} · ${c.titulo}`,
      visiblePara: role === 'cliente' ? 'cliente' : 'abogado',
      noLeidos: this._unread()[c.id] ?? 0,
      mensajes: this._messages()[c.id] ?? [],
    };
  }

  private ensureLoaded(id: string): void {
    if (!isObjectId(id) || this.fetched.has(id)) return;
    this.fetched.add(id);
    const me = this.auth.user()?.nombre ?? '';
    this.api.get<ApiMessage[]>(`messages/${id}`).subscribe({
      next: (list) => {
        this._messages.update((map) => ({ ...map, [id]: list.map((m) => mapMessage(m, me)) }));
        const unread = list.filter((m) => !m.leido && m.emisor !== me).length;
        this._unread.update((u) => ({ ...u, [id]: this.activeId() === id ? 0 : unread }));
      },
      error: () => this.fetched.delete(id),
    });
  }

  private append(convId: string, msg: ChatMessage): void {
    this._messages.update((map) => ({ ...map, [convId]: [...(map[convId] ?? []), msg] }));
  }
}

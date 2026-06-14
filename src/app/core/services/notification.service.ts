import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { AppNotification } from '../models';
import { ApiService } from './api.service';
import { AuthStore } from '../store/auth.store';
import { ApiNotification, mapNotification } from './api.mappers';

/**
 * Centro de notificaciones del sistema, sincronizado con GET /api/notifications
 * (filtradas por destinatario en el backend vía JWT). push() publica avisos
 * locales inmediatos — el backend no expone POST /api/notifications — y la
 * campana del layout consume items/unread.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private seq = 0;
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthStore);

  private readonly _items = signal<AppNotification[]>([]);
  readonly items = this._items.asReadonly();
  readonly unread = computed(() => this._items().filter((n) => !n.leida).length);

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) this.load();
      else this._items.set([]);
    });
  }

  load(): void {
    this.api.get<ApiNotification[]>('notifications').subscribe({
      next: (list) => this._items.set(list.map(mapNotification)),
      error: () => this._items.set([]),
    });
  }

  push(n: Omit<AppNotification, 'id' | 'leida' | 'time'>): void {
    const item: AppNotification = { ...n, id: 'n-' + Date.now() + '-' + ++this.seq, leida: false, time: 'Hace un momento' };
    this._items.update((list) => [item, ...list]);
  }

  /**
   * Inserta una notificación recibida en vivo (Socket.IO) sin recargar.
   * Llega ya dirigida al usuario por el backend; la campana se actualiza sola.
   */
  addRealtime(dto: ApiNotification): void {
    const item = mapNotification(dto);
    this._items.update((list) =>
      list.some((n) => n.id === item.id) ? list : [item, ...list]);
  }

  /** Marca local: el backend solo expone marcado masivo (read-all). */
  markRead(id: string): void {
    this._items.update((list) => list.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  }

  markAllRead(): void {
    this._items.update((list) => list.map((n) => ({ ...n, leida: true })));
    this.api.patch('notifications/read-all', {}).subscribe();
  }
}

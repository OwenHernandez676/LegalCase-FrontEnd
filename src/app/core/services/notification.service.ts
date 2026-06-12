import { Injectable, signal, computed } from '@angular/core';
import { AppNotification } from '../models';
import { MOCK_NOTIFS } from './mock-data';

/**
 * Centro de notificaciones del sistema. Cualquier módulo (mensajes, documentos,
 * actividad, eventos) publica aquí mediante push(); la campana del layout consume
 * items/unread y navega usando la ruta de cada notificación.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private seq = 0;
  private readonly _items = signal<AppNotification[]>(MOCK_NOTIFS);
  readonly items = this._items.asReadonly();
  readonly unread = computed(() => this._items().filter((n) => !n.leida).length);

  push(n: Omit<AppNotification, 'id' | 'leida' | 'time'>): void {
    const item: AppNotification = { ...n, id: 'n-' + Date.now() + '-' + ++this.seq, leida: false, time: 'Hace un momento' };
    this._items.update((list) => [item, ...list]);
  }

  markRead(id: string): void {
    this._items.update((list) => list.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  }

  markAllRead(): void { this._items.update((list) => list.map((n) => ({ ...n, leida: true }))); }
}

import { Injectable, signal, computed } from '@angular/core';
import { AppNotification } from '../models';
import { MOCK_NOTIFS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _items = signal<AppNotification[]>(MOCK_NOTIFS);
  readonly items = this._items.asReadonly();
  readonly unread = computed(() => this._items().filter((n) => !n.leida).length);

  markAllRead(): void { this._items.update((list) => list.map((n) => ({ ...n, leida: true }))); }
}

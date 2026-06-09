import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  title: string;
  msg?: string;
  tone: 'success' | 'warn' | 'info' | 'gold';
}

/** Servicio global de notificaciones efímeras (toasts), basado en signals. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(t: Omit<Toast, 'id'>): void {
    const id = ++this.seq;
    this._toasts.update((list) => [...list, { ...t, id }]);
    setTimeout(() => this.dismiss(id), 3200);
  }
  dismiss(id: number): void { this._toasts.update((list) => list.filter((x) => x.id !== id)); }
}

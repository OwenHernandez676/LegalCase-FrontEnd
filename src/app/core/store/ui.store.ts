import { Injectable, signal } from '@angular/core';

/**
 * Estado global de UI basado en Signals.
 * Patrón "store como servicio": estado privado (signal de escritura) +
 * selectores públicos (readonly). Desacoplado y reutilizable.
 */
@Injectable({ providedIn: 'root' })
export class UiStore {
  private readonly _sidebarOpen = signal<boolean>(false);
  readonly sidebarOpen = this._sidebarOpen.asReadonly();

  toggleSidebar(): void { this._sidebarOpen.update((v) => !v); }
  closeSidebar(): void { this._sidebarOpen.set(false); }
}

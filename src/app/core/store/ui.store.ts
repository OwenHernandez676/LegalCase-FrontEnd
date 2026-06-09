import { Injectable, signal, computed } from '@angular/core';

type Theme = 'light' | 'dark';

/**
 * Estado global de UI basado en Signals.
 * Patrón "store como servicio": estado privado (signal de escritura) +
 * selectores públicos (readonly/computed). Desacoplado y reutilizable.
 */
@Injectable({ providedIn: 'root' })
export class UiStore {
  private readonly _theme = signal<Theme>(this.readInitialTheme());
  private readonly _sidebarOpen = signal<boolean>(false);

  readonly theme = this._theme.asReadonly();
  readonly sidebarOpen = this._sidebarOpen.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    this.applyTheme(this._theme());
  }

  toggleTheme(): void {
    const next: Theme = this._theme() === 'light' ? 'dark' : 'light';
    this._theme.set(next);
    localStorage.setItem('legalcase.theme', next);
    this.applyTheme(next);
  }

  toggleSidebar(): void { this._sidebarOpen.update((v) => !v); }
  closeSidebar(): void { this._sidebarOpen.set(false); }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
  private readInitialTheme(): Theme {
    return (localStorage.getItem('legalcase.theme') as Theme) || 'light';
  }
}

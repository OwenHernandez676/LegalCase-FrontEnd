import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { StateService } from './core/services/state.service';
import { AuthService } from './core/services/auth.service';
import { NotificationBellComponent } from './shared/components/notification-bell/notification-bell';
import { AvatarComponent } from './shared/components/avatar/avatar';

interface Toast {
  id: string;
  title: string;
  message: string;
  priority: 'normal' | 'urgente';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NotificationBellComponent,
    AvatarComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly state = inject(StateService);
  protected readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isSidebarOpen = signal(true);
  protected readonly role = this.state.activeRole;
  protected readonly user = this.auth.user;

  protected readonly toasts = signal<Toast[]>([]);

  constructor() {
    // Toasts disparados por eventos reales (tiempo real) del backend.
    this.state.toast$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((t) => this.triggerToast(t.title, t.message, t.priority));
  }

  protected get isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  protected roleLabel(): string {
    const r = this.role();
    return r === 'lawyer' ? 'Abogado' : r === 'client' ? 'Cliente' : 'Administrador';
  }

  protected displayName(): string {
    return this.user()?.nombre ?? 'Usuario';
  }

  toggleSidebar() {
    this.isSidebarOpen.update((val) => !val);
  }

  logout() {
    this.auth.logout();
  }

  private triggerToast(title: string, message: string, priority: 'normal' | 'urgente') {
    const newToast: Toast = {
      id: 't_' + Math.random().toString(36).substring(2, 9),
      title,
      message,
      priority,
    };
    this.toasts.update((all) => [...all, newToast]);
    setTimeout(() => this.removeToast(newToast.id), 5000);
  }

  protected removeToast(id: string) {
    this.toasts.update((all) => all.filter((t) => t.id !== id));
  }
}

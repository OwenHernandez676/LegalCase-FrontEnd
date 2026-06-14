import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { AuthStore } from '@core/store/auth.store';
import { UiStore } from '@core/store/ui.store';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { RealtimeService } from '@core/services/realtime.service';
import { AppNotification, NotificationType, Role } from '@core/models';

interface NavItem { label: string; icon: any; path: string; roles: Role[]; }

const NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: 'dashboard', roles: ['administrador', 'abogado', 'cliente'] },
  { label: 'Solicitudes', icon: 'inbox', path: 'requests', roles: ['administrador'] },
  { label: 'Expedientes', icon: 'folder', path: 'cases', roles: ['administrador', 'abogado'] },
  { label: 'Calendario', icon: 'cal', path: 'calendar', roles: ['abogado'] },
  { label: 'Abogados', icon: 'users', path: 'users', roles: ['administrador'] },
  { label: 'Mensajes', icon: 'msg', path: 'messages', roles: ['abogado', 'cliente'] },
];

/** Ruta de respaldo por tipo cuando la notificación no trae ruta propia. */
const NOTIF_ROUTE: Record<NotificationType, string> = {
  comentario: '/app/cases',
  audiencia: '/app/calendar',
  documento: '/app/cases',
  estado: '/app/cases',
  solicitud: '/app/requests',
  mensaje: '/app/messages',
  evento: '/app/calendar',
};

@Component({
  selector: 'lex-app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, AvatarComponent],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
})
export class AppLayoutComponent {
  readonly auth = inject(AuthStore);
  readonly ui = inject(UiStore);
  readonly notifs = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  // Instancia el canal de tiempo real (Socket.IO) al montar el shell tras el login.
  private readonly realtime = inject(RealtimeService);

  readonly nav = computed(() => {
    const role = this.auth.role();
    return role ? NAV.filter((n) => n.roles.includes(role)) : [];
  });
  readonly roleLabel = computed(() => {
    const r = this.auth.role();
    return r === 'administrador' ? 'Administrador' : r === 'abogado' ? 'Abogado' : 'Cliente';
  });

  /** Dropdown de la campana: primero el listado, luego navegación al seleccionar. */
  readonly notifOpen = signal(false);
  toggleNotifs(): void { this.notifOpen.update((v) => !v); }
  closeNotifs(): void { this.notifOpen.set(false); }

  openNotification(n: AppNotification): void {
    this.notifs.markRead(n.id);
    this.closeNotifs();
    this.router.navigateByUrl(n.route ?? NOTIF_ROUTE[n.tipo]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

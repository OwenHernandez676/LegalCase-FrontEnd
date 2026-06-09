import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { AuthStore } from '@core/store/auth.store';
import { UiStore } from '@core/store/ui.store';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { Role } from '@core/models';

interface NavItem { label: string; icon: any; path: string; roles: Role[]; }

const NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: 'dashboard', roles: ['administrador', 'abogado', 'cliente'] },
  { label: 'Solicitudes', icon: 'inbox', path: 'requests', roles: ['administrador'] },
  { label: 'Expedientes', icon: 'folder', path: 'cases', roles: ['administrador', 'abogado'] },
  { label: 'Tablero Kanban', icon: 'layers', path: 'kanban', roles: ['administrador', 'abogado'] },
  { label: 'Calendario', icon: 'cal', path: 'calendar', roles: ['administrador', 'abogado', 'cliente'] },
  { label: 'Documentos', icon: 'doc', path: 'documents', roles: ['administrador', 'abogado', 'cliente'] },
  { label: 'Tareas', icon: 'list', path: 'tasks', roles: ['abogado'] },
  { label: 'Abogados y Usuarios', icon: 'users', path: 'users', roles: ['administrador'] },
  { label: 'Mensajes', icon: 'msg', path: 'messages', roles: ['administrador', 'abogado', 'cliente'] },
  { label: 'Reportes', icon: 'chart', path: 'reports', roles: ['administrador'] },
  { label: 'Configuración', icon: 'settings', path: 'settings', roles: ['administrador', 'abogado', 'cliente'] },
];

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

  readonly nav = computed(() => {
    const role = this.auth.role();
    return role ? NAV.filter((n) => n.roles.includes(role)) : [];
  });
  readonly roleLabel = computed(() => {
    const r = this.auth.role();
    return r === 'administrador' ? 'Administrador' : r === 'abogado' ? 'Abogado' : 'Cliente';
  });

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
